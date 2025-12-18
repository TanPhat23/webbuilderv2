import getToken from "./token";

class ApiClient {
  private static instance: ApiClient;

  private constructor() {}

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async get<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = await getToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API] GET failed:", {
        url,
        status: response.status,
        error: errorText,
      });
      throw new Error(`Failed to fetch: ${url} (${response.status})`);
    }

    const data = await response.json();
    return data;
  }

  async post<T = unknown>(
    url: string,
    data: unknown,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await getToken();

    const response = await fetch(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to post: ${url} (${response.status})`);
    }

    if (response.status === 204) return undefined as unknown as T;

    const text = await response.text();
    if (!text) return undefined as unknown as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  async put<T>(url: string, data: T, options: RequestInit = {}): Promise<T> {
    const token = await getToken();

    const response = await fetch(url, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update: ${url} (${response.status})`);
    }
    return response.json();
  }

  async patch<T>(
    url: string,
    data: Partial<T>,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await getToken();

    const response = await fetch(url, {
      ...options,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to patch: ${url} (${response.status})`);
    }
    return response.json();
  }

  async delete(url: string, options: RequestInit = {}): Promise<boolean> {
    const token = await getToken();

    const response = await fetch(url, {
      ...options,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    if (
      !response.status ||
      (response.status !== 200 && response.status !== 204)
    ) {
      throw new Error(`Failed to delete: ${url} (${response.status})`);
    }
    return true;
  }

  async getPublic<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${url} (${response.status})`);
    }
    return response.json();
  }
}

export default ApiClient.getInstance();
