// $WEB/src/features/preview/lib/reveal.ts
/**
 * Scroll reveal: an element fades or slides in the first time it scrolls into
 * view on the published page. It is a per-element setting
 * (`settings.reveal`, optional `settings.revealDelay` in ms) so the editor
 * inspector and the CLI set it the same way.
 *
 * Pure: element data in, CSS out. The hidden starting state is emitted as CSS
 * keyed on `data-element-id`, so it is in the server-rendered page and the
 * content never flashes visible before it hides. A small effect then adds
 * `wb-in` as each element enters the viewport (see useScrollReveal).
 */
import type { EditorElement } from "@/types/global.type";

export const REVEAL_EFFECTS = ["fade", "fade-up", "fade-down", "fade-left", "fade-right", "zoom"] as const;
export type RevealEffect = (typeof REVEAL_EFFECTS)[number];

export const REVEAL_LABELS: Record<RevealEffect, string> = {
  fade: "Fade in",
  "fade-up": "Fade up",
  "fade-down": "Fade down",
  "fade-left": "From the left",
  "fade-right": "From the right",
  zoom: "Zoom in",
};

export const MAX_REVEAL_DELAY = 2000;
export const REVEALED_CLASS = "wb-in";

/** The starting transform of each effect; the element ends untransformed. */
const FROM: Record<RevealEffect, string> = {
  fade: "none",
  "fade-up": "translateY(24px)",
  "fade-down": "translateY(-24px)",
  "fade-left": "translateX(-24px)",
  "fade-right": "translateX(24px)",
  zoom: "scale(0.96)",
};

export interface RevealItem {
  id: string;
  effect: RevealEffect;
  delay: number;
}

const SAFE_ID = /^[A-Za-z0-9_-]+$/;
const isEffect = (v: unknown): v is RevealEffect => typeof v === "string" && (REVEAL_EFFECTS as readonly string[]).includes(v);

/** The element's reveal, or null when it has none or the value is not valid. */
export function readReveal(element: Pick<EditorElement, "id"> & { settings?: unknown }): RevealItem | null {
  const s = element.settings as { reveal?: unknown; revealDelay?: unknown } | null | undefined;
  if (!s || !isEffect(s.reveal) || !SAFE_ID.test(element.id)) return null;
  const raw = typeof s.revealDelay === "number" && Number.isFinite(s.revealDelay) ? s.revealDelay : 0;
  return { id: element.id, effect: s.reveal, delay: Math.min(MAX_REVEAL_DELAY, Math.max(0, Math.round(raw))) };
}

export function collectReveals(elements: EditorElement[] | undefined): RevealItem[] {
  const out: RevealItem[] = [];
  const visit = (list: EditorElement[] | undefined) => {
    for (const e of list ?? []) {
      const item = readReveal(e);
      if (item) out.push(item);
      visit((e as unknown as { elements?: EditorElement[] }).elements);
    }
  };
  visit(elements);
  return out;
}

const sel = (id: string) => `[data-element-id="${id}"]`;

/** Hidden-until-revealed rules. Empty when nothing on the page has a reveal. */
export function revealCss(items: RevealItem[]): string {
  if (items.length === 0) return "";
  const rules: string[] = [];
  for (const effect of REVEAL_EFFECTS) {
    const ids = items.filter((i) => i.effect === effect).map((i) => i.id);
    if (ids.length === 0) continue;
    const base = ids.map(sel).join(",");
    const hidden = ids.map((id) => `${sel(id)}:not(.${REVEALED_CLASS})`).join(",");
    rules.push(`${base}{transition:opacity .6s ease,transform .6s ease}`);
    rules.push(`${hidden}{opacity:0;${FROM[effect] === "none" ? "" : `transform:${FROM[effect]};`}}`);
  }
  for (const delay of new Set(items.map((i) => i.delay).filter((d) => d > 0))) {
    const ids = items.filter((i) => i.delay === delay).map((i) => sel(i.id)).join(",");
    rules.push(`${ids}{transition-delay:${delay}ms}`);
  }
  // Visitors who ask for less motion get the content at once.
  return `@media (prefers-reduced-motion:no-preference){${rules.join("")}}`;
}

/** Shown only when scripts are off, so content is never left hidden. */
export const REVEAL_NOSCRIPT_CSS = `[data-element-id]{opacity:1!important;transform:none!important}`;
