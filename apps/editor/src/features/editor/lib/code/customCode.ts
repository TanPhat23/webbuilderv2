/**
 * Code a user writes in the code view that the element tree cannot express
 * with plain static attributes alone: extra props on a tag, mixed JSX text
 * expressions, conditional visibility, and imports/hooks around the JSX.
 */

/** Settings that are never written out as attributes of the generated tag. */
export const HIDDEN_SETTINGS: readonly string[] = [
  "interactions",
  "migratedWorkflowLinks",
  "customSubmit",
  "codeProps",
  "codeText",
  "codeVisible",
  "component",
  "componentProps",
];

export type CodeTextSegment = string | { readonly expr: string };

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

export const isEmptyPreamble = (p: Preamble): boolean =>
  !p.imports.trim() && !p.top.trim() && !p.body.trim();

export const MAX_PREAMBLE_LENGTH = 50_000;
export const MAX_CODE_PROPS = 100;
export const MAX_CODE_PROP_LENGTH = 2_000;

const PREAMBLE_KEYS: readonly (keyof Preamble)[] = ["imports", "top", "body"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validates a single segment of mixed JSX text (`string | { expr }`). */
export function isCodeTextSegment(value: unknown): value is CodeTextSegment {
  if (typeof value === "string") return value.length <= MAX_CODE_PROP_LENGTH;
  return (
    isRecord(value) &&
    typeof value.expr === "string" &&
    value.expr.trim().length > 0 &&
    value.expr.length <= MAX_CODE_PROP_LENGTH
  );
}

/** Reads and validates `settings.codeText` segments, returning `undefined` when absent or invalid. */
export function readCodeText(settings: unknown): readonly CodeTextSegment[] | undefined {
  if (!isRecord(settings) || !Array.isArray(settings.codeText)) return undefined;
  if (settings.codeText.length === 0 || settings.codeText.length > MAX_CODE_PROPS) return undefined;
  return settings.codeText.every(isCodeTextSegment) ? settings.codeText : undefined;
}

/** Formats `CodeTextSegment[]` into an inline placeholder string for canvas/text previews. */
export function renderCodeTextPlaceholder(segments: readonly CodeTextSegment[]): string {
  return segments.map((seg) => (typeof seg === "string" ? seg : `{${seg.expr}}`)).join("");
}

/** Reads and validates `settings.codeVisible`, returning a trimmed non-empty expression or `undefined`. */
export function readCodeVisible(settings: unknown): string | undefined {
  if (!isRecord(settings) || typeof settings.codeVisible !== "string") return undefined;
  const trimmed = settings.codeVisible.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_CODE_PROP_LENGTH ? trimmed : undefined;
}

/** A preamble from untrusted input (storage or a request), or null. */
export function toPreamble(value: unknown): Preamble | null {
  if (!isRecord(value)) return null;
  const out = emptyPreamble();
  for (const key of PREAMBLE_KEYS) {
    const part = value[key] ?? "";
    if (typeof part !== "string" || part.length > MAX_PREAMBLE_LENGTH) return null;
    out[key] = part;
  }
  return out;
}

const storageKey = (pageId: string): string => `wb:code-preamble:${pageId}`;

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
