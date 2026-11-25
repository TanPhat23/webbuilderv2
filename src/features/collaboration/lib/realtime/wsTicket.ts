interface WSTicketResponse {
  readonly ticket: string;
  readonly expiresIn: number;
}

function isWSTicketResponse(value: unknown): value is WSTicketResponse {
  if (typeof value !== "object" || value === null) return false;
  const ticket = Reflect.get(value, "ticket");
  const expiresIn = Reflect.get(value, "expiresIn");
  return (
    typeof ticket === "string" &&
    ticket.length > 0 &&
    typeof expiresIn === "number"
  );
}

/**
 * Resolves the HTTP API base URL from `VITE_GO_SERVER_URL`, `VITE_API_URL`,
 * or by converting a WebSocket URL.
 */
export function resolveApiBaseUrl(wsUrl: string): string {
  const env = typeof import.meta !== "undefined" ? import.meta.env : undefined;
  const goServerUrl =
    env && typeof env.VITE_GO_SERVER_URL === "string"
      ? env.VITE_GO_SERVER_URL.trim()
      : "";
  const apiUrl =
    env && typeof env.VITE_API_URL === "string"
      ? env.VITE_API_URL.trim()
      : "";
  const raw = goServerUrl || apiUrl || wsUrl.replace(/^ws(s?):/i, "http$1");
  return raw.replace(/\/+$/, "");
}

/**
 * Mints a single-use WebSocket ticket for `projectId` using the caller's bearer token.
 */
export async function fetchWsTicket(
  projectId: string,
  apiBaseUrl: string,
  getToken: () => Promise<string | null>,
): Promise<string | null> {
  const token = await getToken();
  if (!token) return null;

  const base = apiBaseUrl.replace(/\/+$/, "");
  const encodedProjectId = encodeURIComponent(projectId);
  const response = await fetch(
    `${base}/api/v1/projects/${encodedProjectId}/ws-ticket`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to obtain WebSocket ticket (${response.status})`);
  }

  const body: unknown = await response.json();
  if (!isWSTicketResponse(body)) {
    throw new Error("Invalid WebSocket ticket response");
  }

  return body.ticket;
}
