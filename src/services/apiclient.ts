import getToken from "./token";

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

  private async execute<TResponse>(
    method: HttpMethod,
    url: string,
    data?: unknown,
    options: RequestInit = {},
  ): Promise<TResponse> {
    const token = await getToken();

    const response = await fetch(url, {
      ...options,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] ${method} ${url} failed:`, {
        status: response.status,
        error: errorText,
      });
      throw new Error(`${method} ${url} failed (${response.status})`);
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

  get<TResponse>(url: string, options?: RequestInit): Promise<TResponse> {
    return this.execute<TResponse>("GET", url, undefined, options);
  }

  post<TResponse = unknown, TBody = unknown>(
    url: string,
    data: TBody,
    options?: RequestInit,
  ): Promise<TResponse> {
    return this.execute<TResponse>("POST", url, data, options);
  }

  put<TResponse, TBody = TResponse>(
    url: string,
    data: TBody,
    options?: RequestInit,
  ): Promise<TResponse> {
    return this.execute<TResponse>("PUT", url, data, options);
  }

  patch<TResponse, TData = Partial<TResponse>>(
    url: string,
    data: TData,
    options?: RequestInit,
  ): Promise<TResponse> {
    return this.execute<TResponse>("PATCH", url, data, options);
  }

  async delete(url: string, options?: RequestInit): Promise<boolean> {
    await this.execute<void>("DELETE", url, undefined, options);
    return true;
  }

  getPublic<TResponse>(url: string, options?: RequestInit): Promise<TResponse> {
    return this.execute<TResponse>("GET", url, undefined, options);
  }
}

export default ApiClient.getInstance();
