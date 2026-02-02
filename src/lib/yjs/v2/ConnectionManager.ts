import { EventEmitter } from "events";

/**
 * Options for the ConnectionManager
 */
export interface ConnectionOptions {
  url: string;
  pageId: string;
  projectId: string;
  getToken: () => Promise<string | null>;
  reconnectInterval?: number;
  maxReconnectInterval?: number;
}

/**
 * Handles the WebSocket connection life cycle, including authentication and reconnection logic.
 * Part of the refactored CustomYjsProviderV2.
 */
export class ConnectionManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectTimeout: any = null;
  private reconnectAttempts = 0;
  private isDestroyed = false;
  private connected = false;

  constructor(private options: ConnectionOptions) {
    super();
  }

  /**
   * Initializes the connection
   */
  public async connect(): Promise<void> {
    if (this.isDestroyed || this.connected) return;

    // Clear any existing connection attempt
    this.disconnect();

    try {
      this.validatePageId();
      const token = await this.getAuthToken();
      const wsUrl = this.buildWebSocketUrl(token);

      if (this.isDestroyed) return;

      this.ws = new WebSocket(wsUrl);
      this.setupHandlers();
    } catch (err) {
      if (!this.isDestroyed) {
        this.scheduleReconnect();
      }
    }
  }

  /**
   * Disconnects the current WebSocket and clears reconnection timeouts
   */
  public disconnect(): void {
    this.connected = false;
    if (this.ws) {
      // Remove handlers to prevent recursive calls during close
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.onopen = null;

      try {
        this.ws.close();
      } catch (e) {
        // Ignore errors during close
      }
      this.ws = null;
    }
    this.clearReconnection();
  }

  /**
   * Sends data through the WebSocket
   */
  public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
      return true;
    }
    return false;
  }

  /**
   * Checks if the manager is currently connected
   */
  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * Cleans up resources
   */
  public destroy(): void {
    this.isDestroyed = true;
    this.disconnect();
    this.removeAllListeners();
  }

  private validatePageId(): void {
    if (!this.options.pageId || this.options.pageId === "undefined" || this.options.pageId === "") {
      throw new Error("Invalid pageId for WebSocket connection");
    }
  }

  private async getAuthToken(): Promise<string> {
    const token = await this.options.getToken();
    if (!token) {
      const error = new Error("No authentication token available");
      this.emit("error", error);
      throw error;
    }
    return token;
  }

  private buildWebSocketUrl(token: string): string {
    const params = new URLSearchParams({
      projectId: this.options.projectId,
      token,
    });
    return `${this.options.url}/ws/${this.options.pageId}?${params.toString()}`;
  }

  private setupHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      if (this.isDestroyed) {
        this.ws?.close();
        return;
      }
      this.connected = true;
      this.reconnectAttempts = 0;
      this.emit("open");
    };

    this.ws.onmessage = (event) => {
      this.emit("message", event.data);
    };

    this.ws.onclose = () => {
      const wasConnected = this.connected;
      this.connected = false;

      if (wasConnected) {
        this.emit("close");
      }

      if (!this.isDestroyed) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      this.emit("error", error);
    };
  }

  private scheduleReconnect(): void {
    if (this.isDestroyed || this.reconnectTimeout) return;

    const interval = this.options.reconnectInterval || 3000;
    const maxInterval = this.options.maxReconnectInterval || 30000;
    const delay = Math.min(interval * Math.pow(2, this.reconnectAttempts), maxInterval);

    this.reconnectAttempts++;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      void this.connect();
    }, delay);
  }

  private clearReconnection(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}
