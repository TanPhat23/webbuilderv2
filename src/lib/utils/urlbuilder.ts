export type URLType = "ai" | "api" | "export" | "next" | "none";

const urlMap: Record<Exclude<URLType, "none">, string> = {
  api:
    process.env.GO_SERVER_URL ||
    process.env.NEXT_PUBLIC_GO_SERVER_URL ||
    "http://localhost:8080",
  ai:
    process.env.AI_SERVER_URL ||
    process.env.NEXT_PUBLIC_AI_SERVER_URL ||
    "http://localhost:3001",
  export:
    process.env.AI_EXPORT_SERVER_URL ||
    process.env.NEXT_PUBLIC_AI_EXPORT_SERVER_URL ||
    "http://localhost:5001",
  next:
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000",
};

/**
 * URLBuilder provides a fluent API for constructing URLs based on the target service type.
 */
export class URLBuilder {
  private url: URL;

  constructor(type: URLType) {
    const base =
      type !== "none"
        ? urlMap[type]
        : typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";

    try {
      this.url = new URL(base);
    } catch (e) {
      this.url = new URL(
        base,
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000",
      );
    }
  }

  /**
   * Overwrites the current URL path.
   */
  setPath(path: string): URLBuilder {
    this.url.pathname = path;
    return this;
  }

  /**
   * Appends a path segment to the current URL path.
   */
  addPathSegment(segment: string): URLBuilder {
    if (!this.url.pathname.endsWith("/")) {
      this.url.pathname += "/";
    }
    this.url.pathname += segment.replace(/^\/+/, "");
    return this;
  }

  /**
   * Adds a query parameter to the URL.
   */
  addQueryParam(key: string, value: string): URLBuilder {
    this.url.searchParams.append(key, value);
    return this;
  }

  /**
   * Returns the constructed URL string.
   */
  build(): string {
    return this.url.toString();
  }
}
