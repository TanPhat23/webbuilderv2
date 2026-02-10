import { EventEmitter } from "events";
import type {
  PendingRequest,
  RateLimiter,
  WSEnvelope,
  WSMessageType,
} from "@/interfaces/websocket";

/**
 * Handles request tracking, rate limiting, message envelope creation, and
 * offline queuing for the Yjs-backed WebSocket provider.
 *
 * Updated to use the new standard WSEnvelope message format:
 *   { type, projectId, pageId, userId, requestId, timestamp, payload }
 *
 * @see WebSocket API Reference — Section 2: Message Envelope
 */
export class MessageDispatcher extends EventEmitter {
  private readonly pendingRequests = new Map<string, PendingRequest>();
  private requestIdCounter = 0;
  private messageQueue: WSEnvelope[] = [];

  private readonly rateLimiter: RateLimiter = {
    tokens: 100,
    maxTokens: 100,
    refillRate: 100, // tokens per second
    lastRefill: Date.now(),
  };

  constructor() {
    super();
  }

  // --------------------------------------------------------------------------
  // Envelope Factory
  // --------------------------------------------------------------------------

  /**
   * Creates a standard message envelope following the WebSocket API spec.
   *
   * @param type      The action type (e.g. `element:create`)
   * @param projectId ID of the project
   * @param pageId    ID of the page
   * @param payload   Action-specific data
   * @param options   Optional userId and requestId overrides
   */
  public createEnvelope<T>(
    type: WSMessageType,
    projectId: string,
    pageId: string,
    payload: T,
    options?: {
      userId?: string;
      requestId?: string;
    },
  ): WSEnvelope<T> {
    return {
      type,
      projectId,
      pageId,
      userId: options?.userId,
      requestId: options?.requestId,
      timestamp: Date.now(),
      payload,
    };
  }

  // --------------------------------------------------------------------------
  // Request ID Generation
  // --------------------------------------------------------------------------

  /**
   * Generates a unique request ID for tracking request/response cycles.
   * Format: `req-<timestamp>-<counter>` for easy debugging.
   */
  public generateRequestId(): string {
    return `req-${Date.now()}-${++this.requestIdCounter}`;
  }

  // --------------------------------------------------------------------------
  // Rate Limiting (Token Bucket)
  // --------------------------------------------------------------------------

  /**
   * Implements a token bucket algorithm to rate limit outgoing operations.
   * @returns `true` if the operation is allowed, `false` if rate limited.
   */
  public checkRateLimit(): boolean {
    const now = Date.now();
    const timePassed = now - this.rateLimiter.lastRefill;

    // Refill tokens based on elapsed time
    const tokensToAdd = (timePassed * this.rateLimiter.refillRate) / 1000;
    this.rateLimiter.tokens = Math.min(
      this.rateLimiter.maxTokens,
      this.rateLimiter.tokens + tokensToAdd,
    );
    this.rateLimiter.lastRefill = now;

    if (this.rateLimiter.tokens >= 1) {
      this.rateLimiter.tokens -= 1;
      return true;
    }

    return false;
  }

  // --------------------------------------------------------------------------
  // Pending Request Tracking
  // --------------------------------------------------------------------------

  /**
   * Creates a promise-based pending request that will be resolved when a
   * matching response message arrives (correlated by `requestId`), or
   * rejected on timeout.
   *
   * @param requestId  The client-generated request ID
   * @param timeoutMs  How long to wait before timing out (default: 10s)
   */
  public createPendingRequest<T>(
    requestId: string,
    timeoutMs: number = 10_000,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(
            new Error(`Request ${requestId} timed out after ${timeoutMs}ms`),
          );
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
   * Resolves or rejects a pending request based on a server response.
   * Called when an incoming message contains a matching `requestId`.
   *
   * @param requestId The requestId from the server response
   * @param success   Whether the response indicates success or error
   * @param data      The response data to resolve with, or error info to reject with
   * @returns `true` if a pending request was found and handled
   */
  public resolvePendingRequest(
    requestId: string,
    success: boolean,
    data: unknown,
  ): boolean {
    const pending = this.pendingRequests.get(requestId);
    if (!pending) return false;

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(requestId);

    if (success) {
      pending.resolve(data);
    } else {
      const errData = data as
        | {
            message?: string;
            error?: string;
            code?: string;
            payload?: { message?: string; code?: string };
          }
        | undefined;
      const errorMsg =
        errData?.payload?.message ||
        errData?.message ||
        errData?.error ||
        errData?.payload?.code ||
        errData?.code ||
        "Unknown error";
      pending.reject(new Error(errorMsg));
    }

    return true;
  }

  /**
   * Rejects all currently pending requests.
   * Typically called on WebSocket disconnection.
   */
  public rejectAllPendingRequests(reason: string = "Connection closed"): void {
    this.pendingRequests.forEach((pending) => {
      clearTimeout(pending.timeout);
      pending.reject(new Error(reason));
    });
    this.pendingRequests.clear();
  }

  /** Returns the number of currently pending (unresolved) requests. */
  public get pendingCount(): number {
    return this.pendingRequests.size;
  }

  // --------------------------------------------------------------------------
  // Offline Message Queue
  // --------------------------------------------------------------------------

  /**
   * Adds an envelope to the offline queue.
   * Messages are flushed when the connection is restored.
   */
  public enqueueMessage(message: WSEnvelope): void {
    this.messageQueue.push(message);
    // Keep queue size manageable
    if (this.messageQueue.length > 1000) {
      this.messageQueue.shift();
    }
  }

  /**
   * Returns and clears the current message queue.
   * Call this on reconnection to flush pending messages.
   */
  public consumeQueue(): WSEnvelope[] {
    const queue = [...this.messageQueue];
    this.messageQueue = [];
    return queue;
  }

  /**
   * Checks if there are pending messages in the offline queue.
   */
  public hasQueuedMessages(): boolean {
    return this.messageQueue.length > 0;
  }

  // --------------------------------------------------------------------------
  // Cleanup
  // --------------------------------------------------------------------------

  /**
   * Cleans up all dispatcher resources:
   * rejects pending requests, clears queue, removes event listeners.
   */
  public destroy(): void {
    this.rejectAllPendingRequests("Dispatcher destroyed");
    this.messageQueue = [];
    this.removeAllListeners();
  }
}
