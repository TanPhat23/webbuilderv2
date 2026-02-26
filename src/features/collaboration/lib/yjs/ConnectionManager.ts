import { EventEmitter } from "events";
import type { ConnectionOptions } from "@/features/collaboration";
import { URLBuilder } from "@/utils/urlbuilder";

/**
 * Manages the WebSocket connection lifecycle for the Yjs-backed provider.
 *
 * Updated to match the new WebSocket API spec:
 *   - URL pattern: `ws://<host>/ws/:project?token=<jwt>`
 *   - Exponential backoff with jitter (base 500ms, multiplier 1.5×, max 30s)
 *   - Auto-sends `join` message after connection opens
 *
 * @see WebSocket API Reference — Section 1: Connection
 */
export class ConnectionManager extends EventEmitter {
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

  // --------------------------------------------------------------------------
  // Public API
  // --------------------------------------------------------------------------

  /**
   * Initiate or re-initiate the WebSocket connection.
   * On success, emits `"open"`. On failure, schedules a reconnect.
   */
  public async connect(): Promise<void> {
    if (this.isDestroyed || this._connected) return;

    // Tear down any existing socket
    this.disconnect();

    try {
      const token = await this.getAuthToken();
      const wsUrl = this.buildUrl(token);

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

  // --------------------------------------------------------------------------
  // Internal — Auth & URL
  // --------------------------------------------------------------------------

  private async getAuthToken(): Promise<string> {
    const token = await this.options.getToken();
    if (!token) {
      const error = new Error("No authentication token available");
      this.emit("error", error);
      throw error;
    }
    return token;
  }

  /**
   * Build the WebSocket URL following the new spec:
   *   `ws://<host>/ws/:project?token=<jwt>`
   *
   * Browser WebSocket API cannot set custom headers on the handshake,
   * so the token is passed as a query parameter.
   */
  private buildUrl(token: string): string {
    const projectId = encodeURIComponent(this.options.projectId);
    return new URLBuilder(this.options.url)
      .setPath(`/ws/${projectId}`)
      .addQueryParam("token", token)
      .build();
  }

  // --------------------------------------------------------------------------
  // Internal — WebSocket event handlers
  // --------------------------------------------------------------------------

  private attachHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      if (this.isDestroyed) {
        this.ws?.close();
        return;
      }
      this._connected = true;
      this.reconnectAttempts = 0;
      this.emit("open");

      // Auto-send `join` message so the server knows which page we want
      this.sendJoinMessage();
    };

    this.ws.onmessage = (event) => {
      this.emit("message", event.data);
    };

    this.ws.onclose = () => {
      const wasConnected = this._connected;
      this._connected = false;

      if (wasConnected) {
        this.emit("close");
      }

      if (!this.isDestroyed) {
        this.scheduleReconnect();
      }
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
  private sendJoinMessage(): void {
    const joinEnvelope = JSON.stringify({
      type: "join",
      projectId: this.options.projectId,
      pageId: this.options.pageId,
      timestamp: Date.now(),
      payload: {
        pageId: this.options.pageId,
      },
    });

    this.send(joinEnvelope);
  }

  // --------------------------------------------------------------------------
  // Internal — Reconnection with exponential backoff + jitter
  // --------------------------------------------------------------------------

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
