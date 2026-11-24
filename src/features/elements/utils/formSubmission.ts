export interface SubmitFormParams {
  readonly apiBaseUrl: string;
  readonly projectId: string;
  readonly collectionId: string;
  readonly payload: Readonly<Record<string, string>>;
  readonly fetchImpl?: typeof fetch;
}

export type FormSubmitResult =
  | {
      readonly ok: true;
      readonly id: string;
      readonly slug?: string;
    }
  | {
      readonly ok: false;
      readonly kind: "validation";
      readonly message: string;
      readonly fields: Readonly<Record<string, string>>;
    }
  | {
      readonly ok: false;
      readonly kind: "rate_limited" | "forbidden" | "network" | "server";
      readonly message: string;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === "string") {
      out[k] = v;
    }
  }
  return out;
}

export function buildPublicCollectionSubmitUrl(
  apiBaseUrl: string,
  projectId: string,
  collectionId: string,
): string {
  const base = apiBaseUrl.replace(/\/+$/, "");
  return `${base}/api/v1/public/projects/${encodeURIComponent(projectId)}/collections/${encodeURIComponent(collectionId)}/items`;
}

export function extractFormPayload(
  form: HTMLFormElement,
): Record<string, string> {
  const data = new FormData(form);
  const payload: Record<string, string> = {};
  for (const [key, value] of data.entries()) {
    if (typeof value === "string") {
      payload[key] = value;
    }
  }
  return payload;
}

export async function submitFormToCollection(
  params: SubmitFormParams,
): Promise<FormSubmitResult> {
  const fetchFn = params.fetchImpl ?? globalThis.fetch;
  const url = buildPublicCollectionSubmitUrl(
    params.apiBaseUrl,
    params.projectId,
    params.collectionId,
  );

  let response: Response;
  try {
    response = await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params.payload),
    });
  } catch {
    return {
      ok: false,
      kind: "network",
      message: "Could not reach the server. Please try again.",
    };
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (response.ok) {
    const id = isRecord(body) && typeof body.id === "string" ? body.id : "ok";
    const slug =
      isRecord(body) && typeof body.slug === "string" ? body.slug : undefined;
    return { ok: true, id, slug };
  }

  if (response.status === 400) {
    const fields = isRecord(body) ? extractStringRecord(body.fields) : {};
    const message =
      isRecord(body) && typeof body.error === "string" && body.error !== "validation_failed"
        ? body.error
        : "Please check the highlighted fields and try again.";
    return { ok: false, kind: "validation", message, fields };
  }

  if (response.status === 429) {
    return {
      ok: false,
      kind: "rate_limited",
      message: "Too many submissions. Please wait a moment and try again.",
    };
  }

  if (response.status === 403) {
    return {
      ok: false,
      kind: "forbidden",
      message: "This form is not currently accepting submissions.",
    };
  }

  return {
    ok: false,
    kind: "server",
    message: "Something went wrong while submitting the form.",
  };
}
