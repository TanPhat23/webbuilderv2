/**
 * Code a user writes in the code view that the element tree cannot express:
 * extra props on a tag (`{...register("email")}`, `onSubmit={...}`) and the
 * imports and statements around the JSX (`useForm()`, a schema).
 *
 * Props live on the element, in `settings.codeProps`, so they follow it. The
 * rest is per page, a `Preamble`.
 */

/** Settings that are never written out as attributes of the generated tag. */
export const HIDDEN_SETTINGS = ["interactions", "migratedWorkflowLinks", "customSubmit", "codeProps", "component"];

/** Code around the JSX, as source text. */
export interface Preamble {
  /** Import statements. */
  imports: string;
  /** Statements outside the component. */
  top: string;
  /** Statements at the start of the component, before it returns. */
  body: string;
}

export const emptyPreamble = (): Preamble => ({ imports: "", top: "", body: "" });

export const isEmptyPreamble = (p: Preamble): boolean => !p.imports.trim() && !p.top.trim() && !p.body.trim();

export const MAX_PREAMBLE_LENGTH = 50_000;
export const MAX_CODE_PROPS = 100;
export const MAX_CODE_PROP_LENGTH = 2_000;

/** A preamble from untrusted input (storage or a request), or null. */
export function toPreamble(value: unknown): Preamble | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const out = emptyPreamble();
  for (const key of ["imports", "top", "body"] as const) {
    const part = v[key] ?? "";
    if (typeof part !== "string" || part.length > MAX_PREAMBLE_LENGTH) return null;
    out[key] = part;
  }
  return out;
}

const storageKey = (pageId: string) => `wb:code-preamble:${pageId}`;

/** The preamble kept for a page in this browser. Storage can be missing or throw. */
export function readStoredPreamble(pageId: string | undefined): Preamble {
  if (!pageId) return emptyPreamble();
  try {
    const raw = globalThis.localStorage?.getItem(storageKey(pageId));
    return (raw && toPreamble(JSON.parse(raw))) || emptyPreamble();
  } catch {
    return emptyPreamble();
  }
}

export function savePreamble(pageId: string | undefined, preamble: Preamble): void {
  if (!pageId) return;
  try {
    if (isEmptyPreamble(preamble)) globalThis.localStorage?.removeItem(storageKey(pageId));
    else globalThis.localStorage?.setItem(storageKey(pageId), JSON.stringify(preamble));
  } catch {
    // Blocked or full: the preamble lasts for this session only.
  }
}
