import getToken from "./token";
import { networkError, parseErrorResponse } from "./api-error";

const REQUEST_TIMEOUT_MS = 15_000;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

class ApiClient {
  private static instance: ApiClient;

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async request(
    method: HttpMethod,
    url: string,
    data: unknown,
    options: RequestInit,
    token: string | undefined,
  ): Promise<Response> {
    // Honour a caller-supplied signal as well as our own timeout.
    const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
    const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;

    try {
      return await fetch(url, {
        ...options,
        method,
        signal,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers ?? {}),
        },
        body: data !== undefined ? JSON.stringify(data) : undefined,
      });
    } catch (cause) {
      // A caller-initiated abort is not a failure to report.
      if (options.signal?.aborted) throw cause;
      throw networkError(cause, { method, url });
    }
  }

  private async execute<TResponse>(
    method: HttpMethod,
    url: string,
    data?: unknown,
    options: RequestInit = {},
    token?: string,
  ): Promise<TResponse> {
    let resolvedToken = token ?? (await getToken());
    let response = await this.request(method, url, data, options, resolvedToken);

    // A token can expire between being fetched and being checked. Fetch a
    // fresh one and retry once, but only when we own the token.
    if (response.status === 401 && token === undefined) {
      resolvedToken = await getToken();
      response = await this.request(method, url, data, options, resolvedToken);
    }

    if (!response.ok) {
      const error = parseErrorResponse(response.status, await response.text().catch(() => ""), {
        method,
        url,
      });
      console.error(`[API] ${method} ${url} failed:`, {
        status: error.status,
        message: error.message,
        requestId: error.requestId,
      });
      throw error;
    }

    if (response.status === 204) return undefined as unknown as TResponse;

    const text = await response.text();
    if (!text) return undefined as unknown as TResponse;

    try {
      return JSON.parse(text) as TResponse;
    } catch {
      return text as unknown as TResponse;
    }
  }

  get<TResponse>(url: string, options?: RequestInit, token?: string): Promise<TResponse> {
    return this.execute<TResponse>("GET", url, undefined, options, token);
  }

  post<TResponse = unknown, TBody = unknown>(
    url: string,
    data: TBody,
    options?: RequestInit,
    token?: string,
  ): Promise<TResponse> {
    return this.execute<TResponse>("POST", url, data, options, token);
  }

  put<TResponse, TBody = TResponse>(
    url: string,
    data: TBody,
    options?: RequestInit,
    token?: string,
  ): Promise<TResponse> {
    return this.execute<TResponse>("PUT", url, data, options, token);
  }

  patch<TResponse, TData = Partial<TResponse>>(
    url: string,
    data: TData,
    options?: RequestInit,
    token?: string,
  ): Promise<TResponse> {
    return this.execute<TResponse>("PATCH", url, data, options, token);
  }

  async delete(url: string, options?: RequestInit, token?: string): Promise<boolean> {
    await this.execute<void>("DELETE", url, undefined, options, token);
    return true;
  }

  getPublic<TResponse>(url: string, options?: RequestInit): Promise<TResponse> {
    return this.execute<TResponse>("GET", url, undefined, options);
  }
}

export default ApiClient.getInstance();
