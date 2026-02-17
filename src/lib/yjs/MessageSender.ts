/**
 * Centralized message sending + offline-queue flush logic used by the
 * Yjs-backed provider.
 *
 * Responsibilities:
 *  - Decide whether to send an envelope immediately or enqueue it for later
 *  - Flush the MessageDispatcher queue when the WebSocket connection opens
 *  - Re-enqueue any messages that fail to send during a flush
 *  - Reject pending requests on connection close
 *
 * This keeps the Provider focused on building envelopes and request tracking,
 * and encapsulates transport/queue behavior in one place.
 */

import { EventEmitter } from "events";
import { ConnectionManager } from "./ConnectionManager";
import { MessageDispatcher } from "./MessageDispatcher";
import type { WSEnvelope } from "@/interfaces/websocket";

export class MessageSender extends EventEmitter {
  private readonly connection: ConnectionManager;
  private readonly dispatcher: MessageDispatcher;

  private attached = false;

  constructor(connection: ConnectionManager, dispatcher: MessageDispatcher) {
    super();
    this.connection = connection;
    this.dispatcher = dispatcher;

    this.attachHandlers();
  }

  // --------------------------------------------------------------------------
  // Public API
  // --------------------------------------------------------------------------

  /**
   * Send the envelope immediately if the connection is open, otherwise enqueue
   * it for later delivery.
   *
   * Mirror of the old provider helper; keeping the same name makes it an easy
   * drop-in for refactor.
   */
  public sendOrQueue(envelope: WSEnvelope<unknown>): void {
    // Try immediate send; if it fails, enqueue
    if (this.trySend(envelope)) return;

    this.dispatcher.enqueueMessage(envelope);
  }

  /**
   * Send a tracked request:
   *  - enforces rate limiting via MessageDispatcher.checkRateLimit
   *  - registers a pending request via MessageDispatcher.createPendingRequest
   *  - sends or enqueues the envelope
   */
  public async sendRequest<T>(
    envelope: WSEnvelope<unknown>,
    requestId: string,
  ): Promise<T> {
    if (!this.dispatcher.checkRateLimit()) {
      throw new Error("Rate limit exceeded. Please slow down.");
    }

    const promise = this.dispatcher.createPendingRequest<T>(requestId);
    this.sendOrQueue(envelope);
    return promise;
  }

  /**
   * Force a flush of the offline queue. Any messages that fail to send will be
   * re-enqueued so they are retried on the next connection open.
   */
  public flushQueue(): void {
    if (!this.connection.connected) return;

    const queue = this.dispatcher.consumeQueue();
    if (queue.length === 0) return;

    const failed: WSEnvelope<unknown>[] = [];

    for (const msg of queue) {
      try {
        const ok = this.connection.send(JSON.stringify(msg));
        if (!ok) {
          failed.push(msg);
        }
      } catch (err) {
        // Log and mark as failed so it gets re-queued
        // eslint-disable-next-line no-console
        console.error("[MessageSender] Failed to send queued message:", err);
        failed.push(msg);
      }
    }

    // Re-enqueue any messages that didn't make it out
    for (const m of failed) {
      this.dispatcher.enqueueMessage(m);
    }

    if (failed.length > 0) {
      this.emit("flushPartial", { total: queue.length, failed: failed.length });
    } else {
      this.emit("flushComplete", { total: queue.length });
    }
  }

  /**
   * Returns whether there are queued messages.
   */
  public hasQueuedMessages(): boolean {
    return this.dispatcher.hasQueuedMessages();
  }

  /**
   * Clean up listeners and resources.
   */
  public destroy(): void {
    this.detachHandlers();
    this.removeAllListeners();
  }

  // --------------------------------------------------------------------------
  // Internal helpers
  // --------------------------------------------------------------------------

  /**
   * Try to send immediately. Returns true if the send was performed (socket
   * open and `.send()` returned true), false otherwise.
   */
  private trySend(envelope: WSEnvelope<unknown>): boolean {
    if (!this.connection.connected) return false;

    try {
      const sent = this.connection.send(JSON.stringify(envelope));
      return !!sent;
    } catch (err) {
      console.error("[MessageSender] Error while sending message:", err);
      return false;
    }
  }

  // --------------------------------------------------------------------------
  // Connection event wiring
  // --------------------------------------------------------------------------

  private attachHandlers(): void {
    if (this.attached) return;
    this.attached = true;

    this.connection.on("open", this.onOpen);
    this.connection.on("close", this.onClose);
    this.connection.on("error", this.onError);
  }

  private detachHandlers(): void {
    if (!this.attached) return;
    this.attached = false;

    this.connection.off("open", this.onOpen);
    this.connection.off("close", this.onClose);
    this.connection.off("error", this.onError);
  }

  private readonly onOpen = (): void => {
    // Flush queued messages as soon as we are connected
    try {
      this.flushQueue();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[MessageSender] Error flushing queue on open:", err);
    }

    this.emit("connected");
  };

  private readonly onClose = (): void => {
    // Reject any pending requests — mirrors existing behavior in Provider
    try {
      this.dispatcher.rejectAllPendingRequests("Connection closed");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        "[MessageSender] Error rejecting pending requests on close:",
        err,
      );
    }

    this.emit("disconnected");
  };

  private readonly onError = (err: unknown): void => {
    // Surface the error to any listeners
    this.emit("error", err);
  };
}
