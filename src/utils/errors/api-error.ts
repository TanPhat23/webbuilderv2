/** A failed API call, with everything the server told us about it. */
export type ApiErrorKind =
  | "network"
  | "timeout"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  | "server"
  | "client";

export interface FieldError {
  field: string;
  message: string;
  tag?: string;
}

export class ApiError extends Error {
  readonly name = "ApiError";

  constructor(
    message: string,
    readonly status: number,
    readonly kind: ApiErrorKind,
    readonly details: {
      fields?: FieldError[];
      requestId?: string;
      method?: string;
      url?: string;
    } = {},
  ) {
    super(message);
  }

  get fields(): FieldError[] {
    return this.details.fields ?? [];
  }

  get requestId(): string | undefined {
    return this.details.requestId;
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

export function kindFromStatus(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 422) return "validation";
  if (status >= 500) return "server";
  return "client";
}

const FALLBACK: Record<ApiErrorKind, string> = {
  network: "Can't reach the server. Check your connection.",
  timeout: "The request took too long. Please try again.",
  unauthorized: "Your session has expired. Please sign in again.",
  forbidden: "You don't have permission to do that.",
  not_found: "We couldn't find what you asked for.",
  validation: "Some fields need attention.",
  server: "Something went wrong on our side. Please try again.",
  client: "The request couldn't be completed.",
};

/**
 * Turns a non-2xx response into an ApiError. The Go API answers with
 * `{ error, message?, fields?, requestId? }`; anything else (HTML from a
 * proxy, an empty body) falls back to a message chosen from the status.
 */
export function parseErrorResponse(
  status: number,
  bodyText: string,
  context: { method?: string; url?: string } = {},
): ApiError {
  const kind = kindFromStatus(status);
  let body: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(bodyText);
    if (parsed && typeof parsed === "object") body = parsed as Record<string, unknown>;
  } catch {
    /* not JSON */
  }

  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  const fields = Array.isArray(body.fields)
    ? (body.fields as unknown[]).flatMap((f) => {
        if (!f || typeof f !== "object") return [];
        const o = f as Record<string, unknown>;
        const message = str(o.message);
        return message
          ? [{ field: str(o.field) ?? "", message, tag: str(o.tag) }]
          : [];
      })
    : undefined;

  // 5xx bodies carry internals (`message` holds the raw error), so only
  // show those for client errors; servers get a friendly message.
  const serverText = kind === "server" ? undefined : str(body.message) ?? str(body.error);
  const message = serverText ?? (kind === "server" ? FALLBACK.server : str(body.error) ?? FALLBACK[kind]);

  return new ApiError(message, status, kind, {
    fields,
    requestId: str(body.requestId),
    method: context.method,
    url: context.url,
  });
}

export function networkError(
  cause: unknown,
  context: { method?: string; url?: string } = {},
): ApiError {
  const aborted = cause instanceof DOMException && cause.name === "TimeoutError";
  return new ApiError(
    aborted ? FALLBACK.timeout : FALLBACK.network,
    0,
    aborted ? "timeout" : "network",
    context,
  );
}

/** Worth retrying: the request may succeed if sent again unchanged. */
export function isRetryable(e: unknown): boolean {
  if (!isApiError(e)) return false;
  return e.kind === "network" || e.kind === "timeout" || (e.kind === "server" && e.status !== 501);
}

/** The text to show a user for any thrown value. */
export function errorMessage(e: unknown, fallback = "Something went wrong."): string {
  if (isApiError(e)) {
    const first = e.fields[0]?.message;
    return first && e.kind === "validation" ? first : e.message;
  }
  return e instanceof Error && e.message ? e.message : fallback;
}
