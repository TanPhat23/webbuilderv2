import { EventEmitter } from "./EventEmitter";
import type { ConnectionOptions } from "../../interfaces/websocket";
import { URLBuilder } from "@/utils/urlbuilder";
import { classifyClose } from "./connectionErrors";

/**
 * Manages the WebSocket connection lifecycle for the Yjs-backed provider.
 *
 * Updated to match the WebSocket API spec:
 *   - URL pattern: `ws://<host>/ws/:project?ticket=<opaque>`
 *   - Exponential backoff with jitter (base 500ms, multiplier 1.5×, max 30s)
 *   - Auto-sends `join` message after connection opens
 *
 * @see WebSocket API Reference — Section 1: Connection
 */
type ConnectionEvents = {
  open: [];
  close: [];
  /** The server refused the connection in a way retrying will not fix. */
  fatal: [info: { code: number; reason: string; message: string }];
  message: [data: unknown];
  error: [error: Error];
};

export class ConnectionManager extends EventEmitter<ConnectionEvents> {
  private ws: WebSocket | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private isDestroyed = false;
  private _connected = false;

  private readonly baseInterval: number;
  private readonly multiplier: number;
  private readonly maxInterval: number;

  constructor(private readonly options: ConnectionOptions) {
    super();
    this.baseInterval = options.reconnectBaseInterval ?? 500;
    this.multiplier = options.reconnectMultiplier ?? 1.5;
    this.maxInterval = options.maxReconnectInterval ?? 30_000;
  }

  // Public API

  /**
   * Initiate or re-initiate the WebSocket connection.
   * On success, emits `"open"`. On failure, schedules a reconnect.
   */
  public async connect(): Promise<void> {
    if (this.isDestroyed || this._connected) return;

    // Tear down any existing socket
    this.disconnect();

    try {
      const ticket = await this.getAuthTicket();
      const wsUrl = this.buildUrl(ticket);

      if (this.isDestroyed) return;

      this.ws = new WebSocket(wsUrl);
      this.attachHandlers();
    } catch (err) {
      if (!this.isDestroyed) {
        this.emit("error", err instanceof Error ? err : new Error(String(err)));
        this.scheduleReconnect();
      }
    }
  }

  /**
   * Disconnect the current WebSocket and cancel any pending reconnection.
   */
  public disconnect(): void {
    this._connected = false;

    if (this.ws) {
      // Detach handlers to prevent recursive close events
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;

      try {
        this.ws.close();
      } catch {
        /* ignore close errors */
      }
      this.ws = null;
    }

    this.clearReconnection();
  }

  /**
   * Send raw string data through the WebSocket.
   * @returns `true` if the message was sent, `false` if the socket is not open.
   */
  public send(
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
  ): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
      return true;
    }
    return false;
  }

  /** Whether the WebSocket is currently open. */
  public get connected(): boolean {
    return this._connected;
  }

  /** Alias kept for backward compat with old Provider code. */
  public isConnected(): boolean {
    return this._connected;
  }

  /** Permanently tear down the manager and release all resources. */
  public destroy(): void {
    this.isDestroyed = true;
    this.disconnect();
    this.removeAllListeners();
  }

  // Internal — Auth & URL

  private async getAuthTicket(): Promise<string> {
    const ticket = await this.options.getTicket();
    if (!ticket) {
      const error = new Error("No WebSocket ticket available");
      this.emit("error", error);
      throw error;
    }
    return ticket;
  }

  /**
   * Build the WebSocket URL:
   *   `ws://<host>/ws/:project?ticket=<opaque>`
   *
   * Browser WebSocket API cannot set custom headers on the handshake,
   * so the single-use ticket is passed as a query parameter.
   */
  private buildUrl(ticket: string): string {
    const projectId = encodeURIComponent(this.options.projectId);
    const url = new URLBuilder(this.options.url)
      .setPath(`/ws/${projectId}`)
      .addQueryParam("ticket", ticket);
    // A helper socket must not replace the editor's own connection.
    if (this.options.writer) url.addQueryParam("conn", "writer");
    return url.build();
  }

  // Internal — WebSocket event handlers

  private attachHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      if (this.isDestroyed) {
        this.ws?.close();
        return;
      }
      this._connected = true;
      this.reconnectAttempts = 0;
      // The server requires join before any queued operations are sent.
      this.sendJoinMessage();
      this.emit("open");
    };

    this.ws.onmessage = (event) => {
      this.emit("message", event.data);
    };

    this.ws.onclose = (event) => {
      const wasConnected = this._connected;
      this._connected = false;

      if (wasConnected) {
        this.emit("close");
      }

      if (this.isDestroyed) return;

      const verdict = classifyClose(event?.code ?? 1006);
      if (verdict.fatal) {
        // Auth and permission failures do not fix themselves; stop retrying.
        this.isDestroyed = true;
        this.emit("fatal", {
          code: event?.code ?? 1006,
          reason: verdict.reason,
          message: verdict.message,
        });
        return;
      }
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.emit("error", new Error("WebSocket error"));
    };
  }

  /**
   * Automatically send a `join` message after connection opens.
   * The server expects this before any element operations.
   *
   * @see WebSocket API Reference — Section 3: Join Page
   */
  /** Ask the server to (re)join this page, e.g. after a JOIN_REQUIRED error. */
  public rejoin(): boolean {
    return this.sendJoinMessage();
  }

  private sendJoinMessage(): boolean {
    const joinEnvelope = JSON.stringify({
      type: "join",
      projectId: this.options.projectId,
      pageId: this.options.pageId,
      timestamp: Date.now(),
      payload: {
        pageId: this.options.pageId,
      },
    });

    return this.send(joinEnvelope);
  }

  // Internal — Reconnection with exponential backoff + jitter

  /**
   * Schedule a reconnection attempt using exponential backoff with jitter.
   *
   * delay = min(baseInterval × multiplier^attempts, maxInterval)
   * jitter = random(0, delay × 0.5)
   * total  = delay + jitter
   *
   * @see WebSocket API Reference — Reconnection guidance
   */
  private scheduleReconnect(): void {
    if (this.isDestroyed || this.reconnectTimeout) return;

    const exponentialDelay = Math.min(
      this.baseInterval * Math.pow(this.multiplier, this.reconnectAttempts),
      this.maxInterval,
    );

    // Add random jitter: 0–50% of the computed delay
    const jitter = Math.random() * exponentialDelay * 0.5;
    const totalDelay = Math.round(exponentialDelay + jitter);

    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      void this.connect();
    }, totalDelay);
  }

  private clearReconnection(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}
