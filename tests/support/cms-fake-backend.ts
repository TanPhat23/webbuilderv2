/** In-memory CMS REST backend behind a stubbed global fetch. */
export interface FakeCmsRecord extends Record<string, unknown> {
  id: string;
}

export interface Req {
  method: string;
  path: string;
  body: Record<string, unknown> | undefined;
  auth?: string;
}

export interface CmsBackendState {
  types: FakeCmsRecord[];
  fields: Record<string, FakeCmsRecord[]>;
  items: Record<string, FakeCmsRecord[]>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJsonBody(raw: BodyInit | null | undefined): Record<string, unknown> | undefined {
  if (typeof raw !== 'string') return undefined;
  const parsed: unknown = JSON.parse(raw);
  return isRecord(parsed) ? parsed : undefined;
}

function readAuthHeader(headers: HeadersInit | undefined): string | undefined {
  if (!headers) return undefined;
  if (headers instanceof Headers) return headers.get('Authorization') ?? undefined;
  if (Array.isArray(headers)) {
    const match = headers.find(([key]) => key.toLowerCase() === 'authorization');
    return match?.[1];
  }
  return headers.Authorization;
}

function readFieldValues(body: Record<string, unknown> | undefined): Record<string, unknown>[] {
  const raw = body?.fieldValues;
  if (!Array.isArray(raw)) return [];
  return raw.filter(isRecord);
}

export function createCmsBackend(seed?: Partial<CmsBackendState>) {
  const state: CmsBackendState = {
    types: seed?.types ?? [],
    fields: seed?.fields ?? {},
    items: seed?.items ?? {},
  };
  const requests: Req[] = [];
  /** "METHOD /path" -> status to answer with instead of handling the call. */
  const failures = new Map<string, number>();
  let seq = 100;
  const realFetch = globalThis.fetch;

  const json = (data: unknown, status = 200) => Response.json(data, { status });

  const handler = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    const method = init?.method ?? 'GET';
    const body = parseJsonBody(init?.body);
    const req: Req = { method, path: url.pathname, body, auth: readAuthHeader(init?.headers) };
    requests.push(req);

    const failStatus = failures.get(method + ' ' + url.pathname);
    if (failStatus) return new Response('boom', { status: failStatus });

    const m = url.pathname.match(/^\/api\/v1\/content-types(?:\/([^/]+))?(?:\/(fields|items)(?:\/([^/]+))?)?$/);
    if (!m) return json({ error: 'not found' }, 404);
    const [, typeId, sub, subId] = m;

    if (!typeId) {
      if (method === 'GET') return json(state.types);
      if (method === 'POST') {
        const type: FakeCmsRecord = { ...body, id: 't' + ++seq, fields: [], items: [] };
        state.types.push(type);
        return json(type);
      }
    } else if (!sub) {
      const idx = state.types.findIndex((t) => t.id === typeId);
      if (method === 'GET') return idx < 0 ? json({}, 404) : json(state.types[idx]);
      if (method === 'PATCH') {
        state.types[idx] = { ...state.types[idx], ...body };
        return json(state.types[idx]);
      }
      if (method === 'DELETE') {
        state.types.splice(idx, 1);
        return new Response(null, { status: 204 });
      }
    } else {
      const bucket = sub === 'fields' ? state.fields : state.items;
      const list = (bucket[typeId] ??= []);
      if (!subId) {
        if (method === 'GET') return json(list);
        if (method === 'POST') {
          const id = (sub === 'fields' ? 'f' : 'i') + ++seq;
          const rec: FakeCmsRecord = sub === 'fields'
            ? { ...body, id, contentTypeId: typeId }
            : {
                ...body,
                id,
                contentTypeId: typeId,
                fieldValues: readFieldValues(body).map((fv, n) => ({
                  id: 'fv' + n, contentItemId: id, ...fv,
                })),
              };
          list.push(rec);
          return json(rec);
        }
      } else {
        const idx = list.findIndex((e) => e.id === subId);
        if (method === 'GET') return idx < 0 ? json({}, 404) : json(list[idx]);
        if (method === 'PATCH') {
          const next: FakeCmsRecord = { ...list[idx], ...body };
          if (sub === 'items' && Array.isArray(body?.fieldValues)) {
            next.fieldValues = readFieldValues(body).map((fv, n) => ({
              id: 'fv' + n, contentItemId: subId, ...fv,
            }));
          }
          list[idx] = next;
          return json(next);
        }
        if (method === 'DELETE') {
          list.splice(idx, 1);
          return new Response(null, { status: 204 });
        }
      }
    }
    return json({ error: 'unsupported' }, 405);
  };

  return {
    state,
    requests,
    failures,
    install() { globalThis.fetch = handler as typeof fetch; },
    restore() { globalThis.fetch = realFetch; },
    writes: () => requests.filter((r) => r.method !== 'GET'),
    clear() { requests.length = 0; },
  };
}

export type CmsBackend = ReturnType<typeof createCmsBackend>;
