import { EventEmitter } from "events";
import type {
  PendingRequest,
  RateLimiter,
} from "@/interfaces/yjs-v2.interface";

/**
 * Handles request tracking, rate limiting, and message queuing for the YJS Provider.
 * This class isolates the logic for managing asynchronous request-response cycles
 * over a WebSocket and ensures the client doesn't overwhelm the server.
 */
export class MessageDispatcher extends EventEmitter {
  private readonly pendingRequests = new Map<string, PendingRequest>();
  private requestIdCounter = 0;
  private messageQueue: any[] = [];

  private readonly rateLimiter: RateLimiter = {
    tokens: 100,
    maxTokens: 100,
    refillRate: 100, // tokens per second
    lastRefill: Date.now(),
  };

  constructor() {
    super();
  }

  /**
   * Generates a unique request ID for tracking responses.
   */
  public generateRequestId(): string {
    return (++this.requestIdCounter).toString();
  }

  /**
   * Implements a token bucket algorithm to rate limit outgoing operations.
   */
  public checkRateLimit(): boolean {
    const now = Date.now();
    const timePassed = now - this.rateLimiter.lastRefill;

    // Refill tokens based on elapsed time
    const tokensToAdd = (timePassed * this.rateLimiter.refillRate) / 1000;
    this.rateLimiter.tokens = Math.min(
      this.rateLimiter.maxTokens,
      this.rateLimiter.tokens + tokensToAdd
    );
    this.rateLimiter.lastRefill = now;

    if (this.rateLimiter.tokens >= 1) {
      this.rateLimiter.tokens -= 1;
      return true;
    }

    return false;
  }

  /**
   * Creates a promise-based pending request that will be resolved when a
   * matching response message arrives or rejected on timeout.
   */
  public createPendingRequest<T>(
    requestId: string,
    timeoutMs: number = 10000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error(`Request ${requestId} timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout,
      });
    });
  }

  /**
   * Resolves or rejects a pending request based on a response from the server.
   */
  public resolvePendingRequest(requestId: string, success: boolean, data: any): void {
    const pending = this.pendingRequests.get(requestId);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(requestId);

      if (success) {
        pending.resolve(data);
      } else {
        const errorMsg = data?.error || data?.message || "Unknown error";
        pending.reject(new Error(errorMsg));
      }
    }
  }

  /**
   * Rejects all currently pending requests, usually called on disconnection.
   */
  public rejectAllPendingRequests(reason: string = "Connection closed"): void {
    this.pendingRequests.forEach((pending) => {
      clearTimeout(pending.timeout);
      pending.reject(new Error(reason));
    });
    this.pendingRequests.clear();
  }

  /**
   * Adds a message to the offline queue to be sent when the connection is restored.
   */
  public enqueueMessage(message: any): void {
    this.messageQueue.push(message);
    // Keep queue size manageable
    if (this.messageQueue.length > 1000) {
      this.messageQueue.shift();
    }
  }

  /**
   * Returns the current message queue and clears it.
   */
  public consumeQueue(): any[] {
    const queue = [...this.messageQueue];
    this.messageQueue = [];
    return queue;
  }

  /**
   * Checks if there are pending messages in the queue.
   */
  public hasQueuedMessages(): boolean {
    return this.messageQueue.length > 0;
  }

  /**
   * Cleans up the dispatcher resources.
   */
  public destroy(): void {
    this.rejectAllPendingRequests("Dispatcher destroyed");
    this.messageQueue = [];
    this.removeAllListeners();
  }
}
