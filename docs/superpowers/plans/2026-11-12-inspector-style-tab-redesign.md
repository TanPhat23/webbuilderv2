# Inspector Style Tab Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the inspector's Style tab with a compact Figma-style property panel (option B) that fits 280px, hides unused optional properties, and keeps every property the current tab can edit.

**Architecture:**
- Pure helpers in `style/styleModel.ts` (value parsing, section on/off, side expansion, colour alpha) are unit-tested with `node:test`.
- A `useStyleProps(breakpoint)` hook is the only writer, and every write goes through `elementHelper.updateElementStyle`.
- Small primitives (`PropInput`/`StyleField`, `ColorRow`, `SectionHeader`, `Segmented`, `StyleSelect`) build one file per section.
- `StyleTab` assembles the sections, and `Inspector` renders it.
- The old accordion files are deleted at the end, after a grep confirms nothing imports them.

**Tech Stack:** React 19, TypeScript, Tailwind v4, shadcn/ui (Select, Slider, DropdownMenu, Tooltip), zustand 5, @tanstack/react-query, lucide-react, node:test + tsx.

**Spec:** `docs/superpowers/specs/2026-11-12-inspector-style-tab-redesign-design.md`

## Global Constraints

- No data-model change: styles stay `element.styles[breakpoint]`, written only via `elementHelper.updateElementStyle(element, styles, breakpoint, updateElement)`.
- Breakpoints are exactly `"default" | "sm" | "md" | "lg" | "xl"`, labelled `Base SM MD LG XL`.
- The inspector is 280px wide. No horizontal overflow at that width.
- Inputs are 26px tall with 11px text. Prefixes are an icon or 1–2 letters, and every prefix has a tooltip naming the property in plain words.
- Optional sections: Border, Shadow, Effects and the Fill image row. A section is on when any of its keys is set at the current breakpoint, `+` writes the defaults in one batch, and `−` removes the section's keys in one batch.
- `+` defaults:
  - Border: `borderWidth: "1px"`, `borderStyle: "solid"`, `borderColor: "currentColor"`.
  - Shadow: the `sm` preset.
  - Effects: `opacity: 1`.
  - Fill image: `backgroundSize: "cover"`, `backgroundPosition: "center"`, `backgroundRepeat: "no-repeat"`.
- Typography shows for `EDITABLE_ELEMENT_TYPES` (Text, Span, Heading, Label, Blockquote, Code, Button, Input, Textarea, Select, Link).
- Read-only or locked editor: every control is disabled and `+`/`−` are hidden.
- The Settings tab and the `_shared` primitives it imports are unchanged.
- Unit tests live in `tests/*.test.ts`, use `node:test` and `node:assert/strict`, and import with relative paths (`../src/...`). Run them with `bun run test:unit`.
- The type check (`npx tsc --noEmit`) must be clean after every task.

**Plan deviations from the spec, also fixed in the spec in Task 1:**
- Position offsets are four plain T/R/B/L fields; the 650-line constraint-toggle component is not extracted.
- The style clipboard is its own small zustand store (`style/styleClipboard.ts`), not part of the persisted chrome store.

## Review Focus

1. **Shorthand-only spacing**, e.g. `padding: "8px 16px"` from an imported template. The x/y fields must show 16 and 8, and editing x must keep the y sides. Pinned by a `writeAxis` test in Task 1.
2. **Values the parser must not reject**, such as `calc(100% - 2rem)`, `var(--gap)`, `-8px` and `0`. These are accepted unchanged. Pinned by `normalizeCssInput` tests in Task 1.
3. **Colours that aren't hex**, such as `rgb(0 0 0 / .5)`, `var(--primary)` and `transparent`. They show unchanged, the alpha field is disabled, and nothing is rewritten. Pinned by `splitColorAlpha` tests in Task 1.
4. **Clearing a field** (an empty commit). It removes the key instead of writing `""`, so inherited Base values show again. Pinned by `compactStyles` tests in Task 1.
5. **Scrubbing or stepping a keyword**, e.g. ↑ on `auto`. It starts from 0 in the field's default unit instead of producing `NaN`. Pinned by `stepCssValue` tests in Task 1.

---

## File Structure

Create, under `src/features/editor/components/sidebar/style/`:

| File | Responsibility |
|---|---|
| `styleModel.ts` | Pure helpers and constants. No React, and only type imports from the app. |
| `styleClipboard.ts` | zustand store holding the copied style map |
| `useStyleProps.ts` | Read the selected element's styles at a breakpoint; set, setMany, replace, clear |
| `PropInput.tsx` | `PropInput` (draft, validate, scrub, step) and `StyleField` (bound to one key) |
| `controls.tsx` | `Segmented`, `StyleSelect`, `MoreToggle` |
| `ColorRow.tsx` | Swatch + hex + alpha row bound to one key |
| `SectionHeader.tsx` | `Section` wrapper: title, optional `+`/`−`, actions slot |
| `LayoutSection.tsx`, `SpacingSection.tsx`, `PositionSection.tsx` | Always-on sections |
| `TypographySection.tsx`, `FillSection.tsx` | Typography (text only) and Fill |
| `BorderSection.tsx`, `ShadowSection.tsx`, `EffectsSection.tsx` | Optional sections |
| `TailwindClassesEditor.tsx`, `AdvancedSection.tsx` | Classes textarea and Import CSS |
| `StyleTab.tsx` | Selection row, `⋯` menu, section list |
| `BreakpointButtons.tsx` | Base/SM/MD/LG/XL buttons for the inspector tab bar |

Modify: `src/features/editor/components/sidebar/Inspector.tsx`, plus the spec (deviations).

Delete in Task 6, after the grep checks: `configurations/Styles.tsx`, `AppearanceAccordion.tsx`, `TypographyAccordion.tsx`, `TailwindAccordion.tsx`, `BreakpointSelector.tsx`, and the Style-only `_shared` files listed there.

Test: `tests/style-model.test.ts`, `tests/style-clipboard.test.ts`.

---

### Task 1: Style model (pure helpers)

**Files:**
- Create: `src/features/editor/components/sidebar/style/styleModel.ts`
- Test: `tests/style-model.test.ts`
- Modify: `docs/superpowers/specs/2026-11-12-inspector-style-tab-redesign-design.md` (deviations)

**Interfaces:**
- Produces:
  - `type StyleMap = Record<string, string | number | undefined>`
  - `type Breakpoint = "default" | "sm" | "md" | "lg" | "xl"`
  - `BREAKPOINTS: { id: Breakpoint; label: string; minWidth: string }[]`
  - `normalizeCssInput(raw: string, defaultUnit: string): { ok: true; value: string | undefined } | { ok: false }`
  - `splitNumber(value: string | number | undefined): { num: number; unit: string } | null`
  - `stepCssValue(value: string | number | undefined, delta: number, defaultUnit: string): string`
  - `compactStyles(styles: StyleMap): StyleMap`
  - `type OptionalSection = "border" | "shadow" | "effects" | "fillImage"`
  - `SECTION_KEYS: Record<OptionalSection, readonly string[]>`
  - `isSectionOn(styles: StyleMap, section: OptionalSection): boolean`
  - `sectionDefaults(section: OptionalSection): StyleMap`
  - `withoutKeys(styles: StyleMap, keys: readonly string[]): StyleMap`
  - `type Sides = { top: string; right: string; bottom: string; left: string }`
  - `readSides(styles: StyleMap, prop: "padding" | "margin"): Sides`
  - `sidesDiffer(s: Sides): boolean`
  - `writeAxis(styles: StyleMap, prop: "padding" | "margin", axis: "x" | "y", value: string | undefined): StyleMap`
  - `writeSide(styles: StyleMap, prop: "padding" | "margin", side: keyof Sides, value: string | undefined): StyleMap`
  - `splitColorAlpha(value: string | undefined): { hex: string | null; alpha: number; raw: string }`
  - `joinColorAlpha(hex: string, alpha: number): string`
  - `toBackgroundImage(input: string | undefined): string | undefined`
  - `isTextElement(type: string): boolean`
  - `SHADOW_PRESETS: { id: string; label: string; value: string }[]`

- [ ] **Step 1: Write the failing tests**

`tests/style-model.test.ts`:

```ts
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  compactStyles, isSectionOn, isTextElement, joinColorAlpha, normalizeCssInput,
  readSides, sectionDefaults, sidesDiffer, splitColorAlpha, splitNumber,
  stepCssValue, toBackgroundImage, withoutKeys, writeAxis, writeSide,
} from '../src/features/editor/components/sidebar/style/styleModel';

test('normalizeCssInput accepts lengths, keywords and functions', () => {
  assert.deepEqual(normalizeCssInput('16', 'px'), { ok: true, value: '16px' });
  assert.deepEqual(normalizeCssInput('16', ''), { ok: true, value: '16' });
  assert.deepEqual(normalizeCssInput(' 1.5rem ', 'px'), { ok: true, value: '1.5rem' });
  assert.deepEqual(normalizeCssInput('100%', 'px'), { ok: true, value: '100%' });
  assert.deepEqual(normalizeCssInput('-8px', 'px'), { ok: true, value: '-8px' });
  assert.deepEqual(normalizeCssInput('0', 'px'), { ok: true, value: '0px' });
  assert.deepEqual(normalizeCssInput('auto', 'px'), { ok: true, value: 'auto' });
  assert.deepEqual(normalizeCssInput('calc(100% - 2rem)', 'px'), { ok: true, value: 'calc(100% - 2rem)' });
  assert.deepEqual(normalizeCssInput('var(--gap)', 'px'), { ok: true, value: 'var(--gap)' });
  assert.deepEqual(normalizeCssInput('', 'px'), { ok: true, value: undefined });
  assert.deepEqual(normalizeCssInput('12qx', 'px'), { ok: false });
  assert.deepEqual(normalizeCssInput('1 2', 'px'), { ok: false });
});

test('splitNumber and stepCssValue', () => {
  assert.deepEqual(splitNumber('16px'), { num: 16, unit: 'px' });
  assert.deepEqual(splitNumber(0.5), { num: 0.5, unit: '' });
  assert.equal(splitNumber('auto'), null);
  assert.equal(stepCssValue('16px', 1, 'px'), '17px');
  assert.equal(stepCssValue('1.5rem', -0.1, 'px'), '1.4rem');
  assert.equal(stepCssValue('auto', 10, 'px'), '10px');
  assert.equal(stepCssValue(undefined, 1, ''), '1');
});

test('compactStyles drops undefined and empty strings, keeps 0', () => {
  assert.deepEqual(compactStyles({ a: undefined, b: '', c: 0, d: '1px' }), { c: 0, d: '1px' });
});

test('optional sections: on detection, defaults, removal', () => {
  assert.equal(isSectionOn({ color: 'red', width: '1px' }, 'border'), false);
  assert.equal(isSectionOn({ borderRadius: '4px' }, 'border'), true);
  assert.equal(isSectionOn({ boxShadow: '0 1px 2px #0003' }, 'shadow'), true);
  assert.equal(isSectionOn({ opacity: 0 }, 'effects'), true);
  assert.equal(isSectionOn({ backgroundColor: '#fff' }, 'fillImage'), false);
  assert.deepEqual(sectionDefaults('border'), { borderWidth: '1px', borderStyle: 'solid', borderColor: 'currentColor' });
  assert.deepEqual(
    withoutKeys({ borderWidth: '1px', borderColor: 'red', color: 'blue' }, ['borderWidth', 'borderColor']),
    { color: 'blue' },
  );
});

test('readSides: longhands, shorthand fallback, mixed', () => {
  assert.deepEqual(readSides({ paddingLeft: '4px' }, 'padding'), { top: '', right: '', bottom: '', left: '4px' });
  assert.deepEqual(readSides({ padding: '8px 16px' }, 'padding'), { top: '8px', right: '16px', bottom: '8px', left: '16px' });
  assert.deepEqual(readSides({ margin: '1px 2px 3px' }, 'margin'), { top: '1px', right: '2px', bottom: '3px', left: '2px' });
  assert.deepEqual(readSides({ padding: '8px', paddingTop: '2px' }, 'padding'), { top: '2px', right: '8px', bottom: '8px', left: '8px' });
  assert.equal(sidesDiffer({ top: '1px', right: '2px', bottom: '1px', left: '2px' }), false);
  assert.equal(sidesDiffer({ top: '1px', right: '2px', bottom: '1px', left: '3px' }), true);
});

test('writeAxis expands a shorthand and keeps the other axis', () => {
  assert.deepEqual(writeAxis({ padding: '8px 16px', color: 'red' }, 'padding', 'x', '4px'), {
    color: 'red', paddingTop: '8px', paddingBottom: '8px', paddingLeft: '4px', paddingRight: '4px',
  });
  assert.deepEqual(writeAxis({ marginTop: '2px' }, 'margin', 'y', undefined), {});
  assert.deepEqual(writeSide({ padding: '8px' }, 'padding', 'top', '0px'), {
    paddingTop: '0px', paddingRight: '8px', paddingBottom: '8px', paddingLeft: '8px',
  });
});

test('splitColorAlpha / joinColorAlpha', () => {
  assert.deepEqual(splitColorAlpha('#ffffff'), { hex: '#ffffff', alpha: 100, raw: '#ffffff' });
  assert.deepEqual(splitColorAlpha('#FFF'), { hex: '#ffffff', alpha: 100, raw: '#FFF' });
  assert.deepEqual(splitColorAlpha('#00000080'), { hex: '#000000', alpha: 50, raw: '#00000080' });
  assert.deepEqual(splitColorAlpha('var(--primary)'), { hex: null, alpha: 100, raw: 'var(--primary)' });
  assert.deepEqual(splitColorAlpha('rgb(0 0 0 / .5)'), { hex: null, alpha: 100, raw: 'rgb(0 0 0 / .5)' });
  assert.deepEqual(splitColorAlpha(undefined), { hex: null, alpha: 100, raw: '' });
  assert.equal(joinColorAlpha('#000000', 100), '#000000');
  assert.equal(joinColorAlpha('#000000', 50), '#00000080');
});

test('toBackgroundImage wraps bare URLs', () => {
  assert.equal(toBackgroundImage('https://x.test/a.png'), 'url("https://x.test/a.png")');
  assert.equal(toBackgroundImage('url(a.png)'), 'url(a.png)');
  assert.equal(toBackgroundImage('linear-gradient(red, blue)'), 'linear-gradient(red, blue)');
  assert.equal(toBackgroundImage('  '), undefined);
});

test('isTextElement', () => {
  assert.equal(isTextElement('Heading'), true);
  assert.equal(isTextElement('Button'), true);
  assert.equal(isTextElement('Section'), false);
  assert.equal(isTextElement('Image'), false);
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `bun run test:unit`
Expected: FAIL with `Cannot find module '.../style/styleModel'`.

- [ ] **Step 3: Implement `styleModel.ts`**

```ts
/**
 * Pure helpers for the inspector Style tab. No React and no runtime app
 * imports, so they run under node:test.
 */
import type { ElementType } from "@/features/editor/interfaces/elements.interface";

export type StyleMap = Record<string, string | number | undefined>;
export type Breakpoint = "default" | "sm" | "md" | "lg" | "xl";

export const BREAKPOINTS: { id: Breakpoint; label: string; minWidth: string }[] = [
  { id: "default", label: "Base", minWidth: "all widths" },
  { id: "sm", label: "SM", minWidth: "≥ 640px" },
  { id: "md", label: "MD", minWidth: "≥ 768px" },
  { id: "lg", label: "LG", minWidth: "≥ 1024px" },
  { id: "xl", label: "XL", minWidth: "≥ 1280px" },
];

const NUMBER_RE = /^(-?(?:\d+\.?\d*|\.\d+))([a-z%]*)$/i;
const UNITS = new Set(["", "px", "rem", "em", "%", "vh", "vw", "vmin", "vmax", "svh", "dvh", "ch", "ex", "fr", "deg", "turn", "s", "ms", "pt"]);
const KEYWORDS = new Set([
  "auto", "none", "inherit", "initial", "unset", "revert", "normal",
  "fit-content", "min-content", "max-content", "currentcolor", "transparent",
]);
const FUNCTION_RE = /^(calc|var|min|max|clamp|env)\(.*\)$/i;

export function normalizeCssInput(
  raw: string,
  defaultUnit: string,
): { ok: true; value: string | undefined } | { ok: false } {
  const s = raw.trim();
  if (s === "") return { ok: true, value: undefined };
  if (KEYWORDS.has(s.toLowerCase()) || FUNCTION_RE.test(s)) return { ok: true, value: s };
  const m = NUMBER_RE.exec(s);
  if (!m || !UNITS.has(m[2].toLowerCase())) return { ok: false };
  return { ok: true, value: m[2] ? s : `${m[1]}${defaultUnit}` };
}

export function splitNumber(value: string | number | undefined): { num: number; unit: string } | null {
  if (typeof value === "number") return { num: value, unit: "" };
  if (!value) return null;
  const m = NUMBER_RE.exec(value.trim());
  return m ? { num: Number(m[1]), unit: m[2] } : null;
}

export function stepCssValue(value: string | number | undefined, delta: number, defaultUnit: string): string {
  const parts = splitNumber(value);
  const num = parts ? parts.num : 0;
  const unit = parts ? parts.unit || (typeof value === "number" ? "" : defaultUnit) : defaultUnit;
  const next = Math.round((num + delta) * 100) / 100;
  return `${next}${unit}`;
}

export function compactStyles(styles: StyleMap): StyleMap {
  const out: StyleMap = {};
  for (const [k, v] of Object.entries(styles)) {
    if (v !== undefined && v !== "") out[k] = v;
  }
  return out;
}

export type OptionalSection = "border" | "shadow" | "effects" | "fillImage";

export const SECTION_KEYS: Record<OptionalSection, readonly string[]> = {
  border: [
    "borderWidth", "borderStyle", "borderColor", "borderRadius",
    "borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius",
  ],
  shadow: ["boxShadow"],
  effects: [
    "opacity", "transform", "transformOrigin", "filter", "cursor",
    "overflow", "overflowX", "overflowY", "visibility", "boxSizing",
  ],
  fillImage: ["backgroundImage", "backgroundSize", "backgroundPosition", "backgroundRepeat"],
};

export const SHADOW_PRESETS = [
  { id: "sm", label: "Small", value: "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
  { id: "md", label: "Medium", value: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" },
  { id: "lg", label: "Large", value: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" },
  { id: "xl", label: "Extra large", value: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" },
];

export function isSectionOn(styles: StyleMap, section: OptionalSection): boolean {
  return SECTION_KEYS[section].some((k) => styles[k] !== undefined && styles[k] !== "");
}

export function sectionDefaults(section: OptionalSection): StyleMap {
  switch (section) {
    case "border":
      return { borderWidth: "1px", borderStyle: "solid", borderColor: "currentColor" };
    case "shadow":
      return { boxShadow: SHADOW_PRESETS[0].value };
    case "effects":
      return { opacity: 1 };
    case "fillImage":
      return { backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" };
  }
}

export function withoutKeys(styles: StyleMap, keys: readonly string[]): StyleMap {
  const drop = new Set(keys);
  return Object.fromEntries(Object.entries(styles).filter(([k]) => !drop.has(k)));
}

export type Sides = { top: string; right: string; bottom: string; left: string };
type SideKey = keyof Sides;
const SIDE_SUFFIX: Record<SideKey, string> = { top: "Top", right: "Right", bottom: "Bottom", left: "Left" };

function str(v: string | number | undefined): string {
  return v === undefined ? "" : String(v);
}

export function readSides(styles: StyleMap, prop: "padding" | "margin"): Sides {
  const parts = str(styles[prop]).trim().split(/\s+/).filter(Boolean);
  const [t = "", r = t, b = t, l = r] = parts;
  const base: Sides = { top: t, right: r, bottom: b, left: l };
  const out = { ...base };
  for (const side of Object.keys(SIDE_SUFFIX) as SideKey[]) {
    const v = styles[`${prop}${SIDE_SUFFIX[side]}`];
    if (v !== undefined && v !== "") out[side] = str(v);
  }
  return out;
}

export function sidesDiffer(s: Sides): boolean {
  return s.left !== s.right || s.top !== s.bottom;
}

function expand(styles: StyleMap, prop: "padding" | "margin"): StyleMap {
  const sides = readSides(styles, prop);
  const next = withoutKeys(styles, [prop]);
  for (const side of Object.keys(SIDE_SUFFIX) as SideKey[]) {
    next[`${prop}${SIDE_SUFFIX[side]}`] = sides[side] || undefined;
  }
  return next;
}

export function writeSide(
  styles: StyleMap, prop: "padding" | "margin", side: SideKey, value: string | undefined,
): StyleMap {
  const next = expand(styles, prop);
  next[`${prop}${SIDE_SUFFIX[side]}`] = value;
  return compactStyles(next);
}

export function writeAxis(
  styles: StyleMap, prop: "padding" | "margin", axis: "x" | "y", value: string | undefined,
): StyleMap {
  const [a, b]: SideKey[] = axis === "x" ? ["left", "right"] : ["top", "bottom"];
  const next = expand(styles, prop);
  next[`${prop}${SIDE_SUFFIX[a]}`] = value;
  next[`${prop}${SIDE_SUFFIX[b]}`] = value;
  return compactStyles(next);
}

export function splitColorAlpha(value: string | undefined): { hex: string | null; alpha: number; raw: string } {
  const raw = value ?? "";
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(raw.trim());
  if (!m) return { hex: null, alpha: 100, raw };
  let h = m[1].toLowerCase();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const alpha = h.length === 8 ? Math.round((parseInt(h.slice(6), 16) / 255) * 100) : 100;
  return { hex: `#${h.slice(0, 6)}`, alpha, raw };
}

export function joinColorAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(100, Math.round(alpha)));
  if (a >= 100) return hex;
  return `${hex}${Math.round((a / 100) * 255).toString(16).padStart(2, "0")}`;
}

export function toBackgroundImage(input: string | undefined): string | undefined {
  const s = (input ?? "").trim();
  if (!s) return undefined;
  if (/^(https?:|\/|data:)/i.test(s)) return `url("${s}")`;
  return s;
}

const TEXT_TYPES = [
  "Text", "Span", "Heading", "Label", "Blockquote", "Code",
  "Button", "Input", "Textarea", "Select", "Link",
] as const satisfies readonly ElementType[];

export function isTextElement(type: string): boolean {
  return (TEXT_TYPES as readonly string[]).includes(type);
}
```

`TEXT_TYPES` mirrors `EDITABLE_ELEMENT_TYPES` in `constants/elements.ts`. It's copied because that module imports React components, which can't load under node:test; the `satisfies` clause keeps the names type-checked.

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `bun run test:unit`
Expected: all `style-model` tests PASS, and the existing tests still pass.

- [ ] **Step 5: Record the deviations in the spec**

In the spec, under "Sections", change the Position row to read: `position`, `zIndex`; when not static: `top`/`right`/`bottom`/`left` as four fields.

Under "Tab bar and selection row", change "in-memory clipboard in the chrome store" to "in-memory clipboard (`style/styleClipboard.ts`)".

- [ ] **Step 6: Commit**

```bash
git add tests/style-model.test.ts src/features/editor/components/sidebar/style/styleModel.ts docs/superpowers/specs/2026-11-12-inspector-style-tab-redesign-design.md
git commit -m "feat(style): pure style model for the redesigned Style tab"
```

---

### Task 2: Data hook, clipboard and input primitives

**Files:**
- Create: `style/styleClipboard.ts`, `style/useStyleProps.ts`, `style/PropInput.tsx`, `style/controls.tsx`, `style/ColorRow.tsx`, `style/SectionHeader.tsx`
- Test: `tests/style-clipboard.test.ts`

**Interfaces:**
- Consumes: everything from Task 1.
- Produces:
  - `useStyleClipboard` (zustand store), with state `{ copied: StyleMap | null; copy(s: StyleMap): void }`
  - `useStyleProps(breakpoint: Breakpoint)` returning `StyleProps`:
    `{ element: EditorElement | undefined; breakpoint; values: StyleMap; inherited: StyleMap; disabled: boolean; set(k: string, v: string | number | undefined): void; setMany(p: StyleMap): void; replace(next: StyleMap): void; clear(keys: readonly string[]): void }`
  - `type StyleProps = ReturnType<typeof useStyleProps>`
  - `PropInput` props: `{ value; placeholder?; prefix: ReactNode; label: string; defaultUnit?: string; free?: boolean; overridden?: boolean; onClearOverride?(): void; onCommit(v: string | undefined): void; disabled?: boolean; className?: string }`
  - `StyleField` props: `{ sp: StyleProps; k: string; prefix: ReactNode; label: string; defaultUnit?: string; free?: boolean; className?: string }`
  - `Segmented` props: `{ value: string | undefined; options: { value: string; label: ReactNode; title: string }[]; onChange(v: string): void; disabled?: boolean; className?: string }`
  - `StyleSelect` props: `{ sp: StyleProps; k: string; label: string; options: { value: string; label: string }[]; placeholder?: string; className?: string }`
  - `MoreToggle` props: `{ open: boolean; onToggle(): void; label: string }`
  - `ColorRow` props: `{ sp: StyleProps; k: string; label: string }`
  - `Section` props: `{ title: string; optional?: { on: boolean; onAdd(): void; onRemove(): void }; actions?: ReactNode; disabled?: boolean; children?: ReactNode }`

- [ ] **Step 1: Write the failing clipboard test**

`tests/style-clipboard.test.ts`:

```ts
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { useStyleClipboard } from '../src/features/editor/components/sidebar/style/styleClipboard';

test('copy stores a detached copy', () => {
  const src = { color: 'red' };
  useStyleClipboard.getState().copy(src);
  src.color = 'blue';
  assert.deepEqual(useStyleClipboard.getState().copied, { color: 'red' });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `bun run test:unit`
Expected: FAIL, because the module is not found.

- [ ] **Step 3: Implement `styleClipboard.ts`**

```ts
import { create } from "zustand";
import type { StyleMap } from "./styleModel";

/** In-memory "copy styles" buffer for the Style tab's ⋯ menu. */
export const useStyleClipboard = create<{
  copied: StyleMap | null;
  copy: (s: StyleMap) => void;
}>()((set) => ({
  copied: null,
  copy: (s) => set({ copied: { ...s } }),
}));
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `bun run test:unit`
Expected: PASS.

- [ ] **Step 5: Implement `useStyleProps.ts`**

```ts
import type React from "react";
import { useSelectedElement, useUpdateElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useEditorContext } from "@/providers/editorprovider";
import { compactStyles, withoutKeys, type Breakpoint, type StyleMap } from "./styleModel";

/** The single reader/writer of the selected element's styles at a breakpoint. */
export function useStyleProps(breakpoint: Breakpoint) {
  const element = useSelectedElement();
  const updateElement = useUpdateElement();
  const { editor } = useEditorContext();
  const disabled = Boolean(editor.isReadOnly || editor.isLocked);

  const all = (element?.styles ?? {}) as Partial<Record<Breakpoint, StyleMap>>;
  const values: StyleMap = all[breakpoint] ?? {};
  const inherited: StyleMap = breakpoint === "default" ? {} : (all.default ?? {});

  const replace = (next: StyleMap) => {
    if (!element || disabled) return;
    elementHelper.updateElementStyle(
      element,
      compactStyles(next) as React.CSSProperties,
      breakpoint,
      updateElement,
    );
  };

  return {
    element,
    breakpoint,
    values,
    inherited,
    disabled,
    replace,
    set: (k: string, v: string | number | undefined) => replace({ ...values, [k]: v }),
    setMany: (p: StyleMap) => replace({ ...values, ...p }),
    clear: (keys: readonly string[]) => replace(withoutKeys(values, keys)),
  };
}

export type StyleProps = ReturnType<typeof useStyleProps>;
```

- [ ] **Step 6: Implement `PropInput.tsx`**

```tsx
import React, { useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { normalizeCssInput, splitNumber, stepCssValue } from "./styleModel";
import type { StyleProps } from "./useStyleProps";

type PropInputProps = {
  value: string | number | undefined;
  placeholder?: string;
  prefix: React.ReactNode;
  /** Plain-words property name, shown as the prefix tooltip and aria-label. */
  label: string;
  defaultUnit?: string;
  /** Free text (grid templates, transforms, filters): no validation. */
  free?: boolean;
  overridden?: boolean;
  onClearOverride?: () => void;
  onCommit: (v: string | undefined) => void;
  disabled?: boolean;
  className?: string;
};

export function PropInput({
  value, placeholder, prefix, label, defaultUnit = "px", free = false,
  overridden = false, onClearOverride, onCommit, disabled, className,
}: PropInputProps) {
  const raw = value === undefined ? "" : String(value);
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const scrub = useRef<{ x: number; start: string } | null>(null);

  useEffect(() => {
    setDraft(null);
    setInvalid(false);
  }, [raw]);

  const commit = (text: string) => {
    if (free) {
      const t = text.trim();
      onCommit(t === "" ? undefined : t);
      setDraft(null);
      return;
    }
    const r = normalizeCssInput(text, defaultUnit);
    if (!r.ok) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setDraft(null);
    if (r.value !== (raw || undefined)) onCommit(r.value);
  };

  const step = (delta: number) => onCommit(stepCssValue(draft ?? raw, delta, defaultUnit));

  const onPrefixDown = (e: React.PointerEvent) => {
    if (disabled || free) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    scrub.current = { x: e.clientX, start: raw };
  };
  const onPrefixMove = (e: React.PointerEvent) => {
    if (!scrub.current) return;
    const px = e.clientX - scrub.current.x;
    const factor = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
    const delta = Math.trunc(px / 2) * factor;
    if (delta !== 0) onCommit(stepCssValue(scrub.current.start, delta, defaultUnit));
  };
  const onPrefixUp = () => {
    scrub.current = null;
  };

  const parts = splitNumber(raw);
  const shown = draft ?? (parts && parts.unit && !free ? String(parts.num) : raw);
  const unit = draft === null && parts && !free ? parts.unit : "";

  return (
    <div
      className={cn(
        "group/pi relative flex h-[26px] min-w-0 items-center gap-1 rounded-[5px] border border-transparent bg-muted/50 pl-1.5 pr-1.5 text-[11px] transition-colors",
        "focus-within:border-ring/60 focus-within:bg-muted hover:bg-muted/70",
        invalid && "border-destructive/70",
        disabled && "opacity-50",
        className,
      )}
    >
      {overridden && (
        <button
          type="button"
          title="Set at this breakpoint. Click to clear."
          aria-label={`Clear ${label} override`}
          onClick={onClearOverride}
          className="absolute -left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-sky-500"
        />
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            onPointerDown={onPrefixDown}
            onPointerMove={onPrefixMove}
            onPointerUp={onPrefixUp}
            className={cn(
              "flex min-w-3 shrink-0 select-none items-center justify-center text-[10px] text-muted-foreground [&_svg]:h-3 [&_svg]:w-3",
              !free && !disabled && "cursor-ew-resize",
            )}
          >
            {prefix}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">{label}</TooltipContent>
      </Tooltip>
      <input
        aria-label={label}
        aria-invalid={invalid}
        disabled={disabled}
        value={shown}
        placeholder={placeholder}
        onFocus={() => setDraft(raw)}
        onChange={(e) => {
          setDraft(e.target.value);
          setInvalid(false);
        }}
        onBlur={(e) => {
          commit(e.target.value);
          setDraft(null);
          setInvalid(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(e.currentTarget.value);
          else if (e.key === "Escape") {
            setDraft(null);
            setInvalid(false);
            e.currentTarget.blur();
          } else if (!free && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
            e.preventDefault();
            step((e.key === "ArrowUp" ? 1 : -1) * (e.shiftKey ? 10 : 1));
          }
        }}
        className="h-full w-full min-w-0 bg-transparent font-mono text-[11px] text-foreground outline-none placeholder:text-muted-foreground/50"
      />
      {unit && <span className="shrink-0 text-[10px] text-muted-foreground">{unit}</span>}
    </div>
  );
}

/** A PropInput bound to one style key of the selected element. */
export function StyleField({
  sp, k, prefix, label, defaultUnit, free, className,
}: {
  sp: StyleProps;
  k: string;
  prefix: React.ReactNode;
  label: string;
  defaultUnit?: string;
  free?: boolean;
  className?: string;
}) {
  const inherited = sp.inherited[k];
  return (
    <PropInput
      value={sp.values[k]}
      placeholder={inherited !== undefined ? String(inherited) : undefined}
      prefix={prefix}
      label={label}
      defaultUnit={defaultUnit}
      free={free}
      overridden={sp.breakpoint !== "default" && sp.values[k] !== undefined}
      onClearOverride={() => sp.clear([k])}
      onCommit={(v) => sp.set(k, v)}
      disabled={sp.disabled}
      className={className}
    />
  );
}
```

- [ ] **Step 7: Implement `controls.tsx`**

```tsx
import React from "react";
import { MoreHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { StyleProps } from "./useStyleProps";

export function Segmented({
  value, options, onChange, disabled, className,
}: {
  value: string | undefined;
  options: { value: string; label: React.ReactNode; title: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div role="radiogroup" className={cn("flex h-[26px] rounded-[5px] bg-muted/50 p-0.5", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          title={o.title}
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex min-w-0 flex-1 items-center justify-center rounded-[4px] text-[10px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50 [&_svg]:h-3 [&_svg]:w-3",
            value === o.value && "bg-background text-foreground shadow-xs",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const UNSET = "__unset__";

/** A Select bound to one style key. The "—" option clears it. */
export function StyleSelect({
  sp, k, label, options, placeholder = "—", className,
}: {
  sp: StyleProps;
  k: string;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}) {
  const v = sp.values[k];
  const inherited = sp.inherited[k];
  return (
    <Select
      value={v === undefined ? UNSET : String(v)}
      onValueChange={(next) => sp.set(k, next === UNSET ? undefined : next)}
      disabled={sp.disabled}
    >
      <SelectTrigger
        aria-label={label}
        title={label}
        className={cn("h-[26px]! min-w-0 rounded-[5px] border-transparent bg-muted/50 px-2! text-[11px]! shadow-none [&_svg]:size-3!", className)}
      >
        <SelectValue placeholder={inherited !== undefined ? String(inherited) : placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNSET} className="text-xs text-muted-foreground">
          {inherited !== undefined ? `Inherit (${String(inherited)})` : "—"}
        </SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function MoreToggle({ open, onToggle, label }: { open: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-label={label}
      title={label}
      onClick={onToggle}
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground",
        open && "bg-muted text-foreground",
      )}
    >
      <MoreHorizontal className="h-3.5 w-3.5" />
    </button>
  );
}
```

- [ ] **Step 8: Implement `ColorRow.tsx`**

```tsx
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { joinColorAlpha, splitColorAlpha } from "./styleModel";
import type { StyleProps } from "./useStyleProps";

/** Swatch (native picker) · hex/raw text · alpha %. Non-hex values pass through unchanged. */
export function ColorRow({ sp, k, label }: { sp: StyleProps; k: string; label: string }) {
  const value = sp.values[k] as string | undefined;
  const inherited = sp.inherited[k] as string | undefined;
  const { hex, alpha, raw } = splitColorAlpha(value);
  const [draft, setDraft] = useState(raw);
  useEffect(() => setDraft(raw), [raw]);

  const commitText = (t: string) => {
    const s = t.trim();
    sp.set(k, s === "" ? undefined : s);
  };
  const overridden = sp.breakpoint !== "default" && value !== undefined;

  return (
    <div className={cn("relative flex h-[26px] items-center gap-1.5 rounded-[5px] bg-muted/50 px-1.5", sp.disabled && "opacity-50")}>
      {overridden && (
        <button
          type="button"
          aria-label={`Clear ${label} override`}
          title="Set at this breakpoint. Click to clear."
          onClick={() => sp.clear([k])}
          className="absolute -left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-sky-500"
        />
      )}
      <label
        className="relative h-3.5 w-3.5 shrink-0 overflow-hidden rounded-[3px] border border-border"
        style={{ background: value ?? inherited ?? "transparent" }}
        title={label}
      >
        <input
          type="color"
          aria-label={`${label} picker`}
          disabled={sp.disabled}
          value={hex ?? "#000000"}
          onChange={(e) => sp.set(k, joinColorAlpha(e.target.value, alpha))}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      <input
        aria-label={label}
        disabled={sp.disabled}
        value={draft}
        placeholder={inherited ?? "None"}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commitText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && commitText(e.currentTarget.value)}
        className="h-full min-w-0 flex-1 bg-transparent font-mono text-[11px] uppercase outline-none placeholder:normal-case placeholder:text-muted-foreground/50"
      />
      <input
        aria-label={`${label} opacity`}
        title={hex ? "Opacity %" : "Opacity applies to hex colours only"}
        disabled={sp.disabled || !hex}
        defaultValue={alpha}
        key={`${raw}-${alpha}`}
        onBlur={(e) => {
          const n = Number(e.target.value);
          if (hex && Number.isFinite(n)) sp.set(k, joinColorAlpha(hex, n));
        }}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="h-full w-8 shrink-0 bg-transparent text-right font-mono text-[11px] text-muted-foreground outline-none disabled:opacity-40"
      />
      <span className="text-[10px] text-muted-foreground">%</span>
    </div>
  );
}
```

- [ ] **Step 9: Implement `SectionHeader.tsx`**

```tsx
import React from "react";
import { Minus, Plus } from "lucide-react";

/** A Style-tab section: title row, optional +/− toggle, and the body when on. */
export function Section({
  title, optional, actions, disabled, children,
}: {
  title: string;
  optional?: { on: boolean; onAdd: () => void; onRemove: () => void };
  actions?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  const on = optional ? optional.on : true;
  return (
    <section className="border-b border-border/60 px-3 py-2.5 last:border-b-0">
      <div className="flex h-5 items-center gap-1">
        <h3 className={on ? "flex-1 text-[11px] font-semibold text-foreground/90" : "flex-1 text-[11px] font-semibold text-muted-foreground"}>
          {title}
        </h3>
        {on && actions}
        {optional && !disabled && (
          <button
            type="button"
            aria-label={on ? `Remove ${title.toLowerCase()}` : `Add ${title.toLowerCase()}`}
            title={on ? `Remove ${title.toLowerCase()}` : `Add ${title.toLowerCase()}`}
            onClick={on ? optional.onRemove : optional.onAdd}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {on ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
      {on && children && <div className="mt-2 flex flex-col gap-1.5">{children}</div>}
    </section>
  );
}
```

- [ ] **Step 10: Type-check and test**

Run: `npx tsc --noEmit && bun run test:unit`
Expected: the type check is clean and all tests pass.

- [ ] **Step 11: Commit**

```bash
git add tests/style-clipboard.test.ts src/features/editor/components/sidebar/style/
git commit -m "feat(style): style hook, clipboard and input primitives"
```

---

### Task 3: Always-on sections (Layout, Spacing, Position)

**Files:**
- Create: `style/LayoutSection.tsx`, `style/SpacingSection.tsx`, `style/PositionSection.tsx`

**Interfaces:**
- Consumes:
  - `StyleProps`, `StyleField`, `Segmented`, `StyleSelect`, `MoreToggle`, `Section` (Task 2);
  - `readSides`, `sidesDiffer`, `writeAxis`, `writeSide` (Task 1);
  - `AlignmentMatrix` from `../configurations/_shared/display/AlignmentMatrix`, with props `{ justifyContent?: string; alignItems?: string; onBatchUpdate(partial): void }`.
- Produces: `LayoutSection`, `SpacingSection`, `PositionSection`, each taking `({ sp }: { sp: StyleProps })`.

- [ ] **Step 1: Implement `LayoutSection.tsx`**

```tsx
import { useState } from "react";
import { ArrowDown, ArrowRight, WrapText } from "lucide-react";
import { AlignmentMatrix } from "../configurations/_shared/display/AlignmentMatrix";
import { Section } from "./SectionHeader";
import { StyleField } from "./PropInput";
import { MoreToggle, Segmented, StyleSelect } from "./controls";
import type { StyleProps } from "./useStyleProps";

const DISPLAY = [
  { value: "block", label: "Block", title: "Block" },
  { value: "flex", label: "Flex", title: "Flex (auto layout)" },
  { value: "grid", label: "Grid", title: "Grid" },
  { value: "none", label: "None", title: "Hidden (display: none)" },
];

const ALIGN_SELF = ["auto", "flex-start", "center", "flex-end", "stretch", "baseline"].map((v) => ({ value: v, label: v }));
const OBJECT_FIT = ["fill", "contain", "cover", "none", "scale-down"].map((v) => ({ value: v, label: v }));

export function LayoutSection({ sp }: { sp: StyleProps }) {
  const [more, setMore] = useState(false);
  const display = String(sp.values.display ?? sp.inherited.display ?? "");
  const isFlex = display === "flex" || display === "inline-flex";
  const isGrid = display === "grid" || display === "inline-grid";
  const wrap = (sp.values.flexWrap ?? sp.inherited.flexWrap) === "wrap";

  return (
    <Section title="Layout" actions={<MoreToggle open={more} onToggle={() => setMore((m) => !m)} label="More size options" />}>
      <Segmented value={display} options={DISPLAY} onChange={(v) => sp.set("display", v)} disabled={sp.disabled} />

      {isFlex && (
        <>
          <div className="grid grid-cols-3 gap-1.5">
            <Segmented
              value={String(sp.values.flexDirection ?? sp.inherited.flexDirection ?? "row")}
              options={[
                { value: "row", label: <ArrowRight />, title: "Horizontal" },
                { value: "column", label: <ArrowDown />, title: "Vertical" },
              ]}
              onChange={(v) => sp.set("flexDirection", v)}
              disabled={sp.disabled}
            />
            <StyleField sp={sp} k="gap" prefix="⇔" label="Gap between children" />
            <button
              type="button"
              aria-pressed={wrap}
              title="Wrap children onto new lines"
              disabled={sp.disabled}
              onClick={() => sp.set("flexWrap", wrap ? "nowrap" : "wrap")}
              className={
                wrap
                  ? "flex h-[26px] items-center justify-center gap-1 rounded-[5px] bg-background text-[10px] text-foreground shadow-xs"
                  : "flex h-[26px] items-center justify-center gap-1 rounded-[5px] bg-muted/50 text-[10px] text-muted-foreground hover:text-foreground"
              }
            >
              <WrapText className="h-3 w-3" /> Wrap
            </button>
          </div>
          <AlignmentMatrix
            justifyContent={sp.values.justifyContent as string | undefined}
            alignItems={sp.values.alignItems as string | undefined}
            onBatchUpdate={(p) => sp.setMany(p as Record<string, string | undefined>)}
          />
        </>
      )}

      {isGrid && (
        <div className="grid grid-cols-2 gap-1.5">
          <StyleField sp={sp} k="gridTemplateColumns" prefix="C" label="Grid columns (e.g. repeat(3, 1fr))" free />
          <StyleField sp={sp} k="gridTemplateRows" prefix="R" label="Grid rows" free />
          <StyleField sp={sp} k="gap" prefix="⇔" label="Gap between cells" className="col-span-2" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-1.5">
        <StyleField sp={sp} k="width" prefix="W" label="Width" />
        <StyleField sp={sp} k="height" prefix="H" label="Height" />
      </div>

      {more && (
        <>
          <div className="grid grid-cols-2 gap-1.5">
            <StyleField sp={sp} k="minWidth" prefix="W↓" label="Min width" />
            <StyleField sp={sp} k="maxWidth" prefix="W↑" label="Max width" />
            <StyleField sp={sp} k="minHeight" prefix="H↓" label="Min height" />
            <StyleField sp={sp} k="maxHeight" prefix="H↑" label="Max height" />
            <StyleField sp={sp} k="aspectRatio" prefix="AR" label="Aspect ratio (e.g. 16 / 9)" free />
            <StyleSelect sp={sp} k="objectFit" label="Object fit (images, video)" options={OBJECT_FIT} placeholder="Fit" />
          </div>
          <p className="pt-1 text-[10px] text-muted-foreground">Inside a flex parent</p>
          <div className="grid grid-cols-2 gap-1.5">
            <StyleSelect sp={sp} k="alignSelf" label="Align self" options={ALIGN_SELF} placeholder="Align self" />
            <StyleField sp={sp} k="flexBasis" prefix="B" label="Flex basis" />
            <StyleField sp={sp} k="flexGrow" prefix="G" label="Flex grow" defaultUnit="" />
            <StyleField sp={sp} k="flexShrink" prefix="S" label="Flex shrink" defaultUnit="" />
            <StyleField sp={sp} k="order" prefix="#" label="Order" defaultUnit="" />
          </div>
        </>
      )}
    </Section>
  );
}
```

- [ ] **Step 2: Implement `SpacingSection.tsx`**

```tsx
import { useState } from "react";
import { Square, SquareDashed } from "lucide-react";
import { Section } from "./SectionHeader";
import { PropInput } from "./PropInput";
import { readSides, sidesDiffer, writeAxis, writeSide, type Sides } from "./styleModel";
import type { StyleProps } from "./useStyleProps";

type Prop = "padding" | "margin";
const SIDES: { side: keyof Sides; short: string }[] = [
  { side: "top", short: "T" }, { side: "right", short: "R" },
  { side: "bottom", short: "B" }, { side: "left", short: "L" },
];

function Group({ sp, prop, perSide }: { sp: StyleProps; prop: Prop; perSide: boolean }) {
  const sides = readSides(sp.values, prop);
  const inh = readSides(sp.inherited, prop);
  const name = prop === "padding" ? "Padding" : "Margin";
  const p = prop === "padding" ? "P" : "M";
  const common = { disabled: sp.disabled };

  if (perSide || sidesDiffer(sides)) {
    return (
      <div className="grid grid-cols-4 gap-1">
        {SIDES.map(({ side, short }) => (
          <PropInput
            key={side}
            {...common}
            value={sides[side] || undefined}
            placeholder={inh[side] || "0"}
            prefix={`${p}${short}`}
            label={`${name} ${side}`}
            onCommit={(v) => sp.replace(writeSide(sp.values, prop, side, v))}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <PropInput
        {...common}
        value={sides.left || undefined}
        placeholder={inh.left || "0"}
        prefix={`${p}↔`}
        label={`${name} left and right`}
        onCommit={(v) => sp.replace(writeAxis(sp.values, prop, "x", v))}
      />
      <PropInput
        {...common}
        value={sides.top || undefined}
        placeholder={inh.top || "0"}
        prefix={`${p}↕`}
        label={`${name} top and bottom`}
        onCommit={(v) => sp.replace(writeAxis(sp.values, prop, "y", v))}
      />
    </div>
  );
}

export function SpacingSection({ sp }: { sp: StyleProps }) {
  const [perSide, setPerSide] = useState(false);
  return (
    <Section
      title="Spacing"
      actions={
        <button
          type="button"
          aria-pressed={perSide}
          title={perSide ? "Edit by axis" : "Edit each side"}
          onClick={() => setPerSide((v) => !v)}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {perSide ? <Square className="h-3.5 w-3.5" /> : <SquareDashed className="h-3.5 w-3.5" />}
        </button>
      }
    >
      <Group sp={sp} prop="padding" perSide={perSide} />
      <Group sp={sp} prop="margin" perSide={perSide} />
    </Section>
  );
}
```

- [ ] **Step 3: Implement `PositionSection.tsx`**

```tsx
import { Section } from "./SectionHeader";
import { StyleField } from "./PropInput";
import { StyleSelect } from "./controls";
import type { StyleProps } from "./useStyleProps";

const POSITIONS = ["static", "relative", "absolute", "fixed", "sticky"].map((v) => ({
  value: v,
  label: v[0].toUpperCase() + v.slice(1),
}));

export function PositionSection({ sp }: { sp: StyleProps }) {
  const position = String(sp.values.position ?? sp.inherited.position ?? "static");
  return (
    <Section title="Position">
      <div className="grid grid-cols-2 gap-1.5">
        <StyleSelect sp={sp} k="position" label="Position type" options={POSITIONS} placeholder="Static" />
        <StyleField sp={sp} k="zIndex" prefix="Z" label="Stack order (z-index)" defaultUnit="" />
      </div>
      {position !== "static" && (
        <div className="grid grid-cols-4 gap-1">
          <StyleField sp={sp} k="top" prefix="T" label="Top offset" />
          <StyleField sp={sp} k="right" prefix="R" label="Right offset" />
          <StyleField sp={sp} k="bottom" prefix="B" label="Bottom offset" />
          <StyleField sp={sp} k="left" prefix="L" label="Left offset" />
        </div>
      )}
    </Section>
  );
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: clean. If `AlignmentMatrix`'s `onBatchUpdate` partial type rejects the cast, cast with `as never` at that one call site and nowhere else.

- [ ] **Step 5: Commit**

```bash
git add src/features/editor/components/sidebar/style/
git commit -m "feat(style): layout, spacing and position sections"
```

---

### Task 4: Typography, Fill, Border, Shadow, Effects, Advanced

**Files:**
- Create: `style/TypographySection.tsx`, `style/FillSection.tsx`, `style/BorderSection.tsx`, `style/ShadowSection.tsx`, `style/EffectsSection.tsx`, `style/TailwindClassesEditor.tsx`, `style/AdvancedSection.tsx`

**Interfaces:**
- Consumes:
  - Task 1: `isSectionOn`, `sectionDefaults`, `SECTION_KEYS`, `SHADOW_PRESETS`, `toBackgroundImage`;
  - Task 2: `Section`, `StyleField`, `PropInput`, `StyleSelect`, `Segmented`, `MoreToggle`, `ColorRow`;
  - `FontFamilyPicker` from `../configurations/_shared/FontFamilyPicker`, with props `{ value: string | undefined; onChange(v: string | undefined): void; fonts: string[]; className? }`;
  - `projectService.getFonts()` from `@/features/projects`;
  - `CssTextareaImporter` (default export) from `../../editor/CssTextareaImporter`;
  - `Slider` from `@/components/ui/slider`.
- Produces: `TypographySection`, `FillSection`, `BorderSection`, `ShadowSection`, `EffectsSection` and `AdvancedSection`, each taking `({ sp })`. `AdvancedSection` also works without `sp`.

- [ ] **Step 1: Implement `TypographySection.tsx`**

```tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react";
import { projectService } from "@/features/projects";
import { FontFamilyPicker } from "../configurations/_shared/FontFamilyPicker";
import { Section } from "./SectionHeader";
import { StyleField } from "./PropInput";
import { ColorRow } from "./ColorRow";
import { MoreToggle, Segmented, StyleSelect } from "./controls";
import type { StyleProps } from "./useStyleProps";

const WEIGHTS = [
  ["100", "Thin"], ["200", "Extra light"], ["300", "Light"], ["400", "Regular"], ["500", "Medium"],
  ["600", "Semibold"], ["700", "Bold"], ["800", "Extra bold"], ["900", "Black"],
].map(([value, label]) => ({ value, label }));
const opts = (xs: string[]) => xs.map((v) => ({ value: v, label: v }));

export function TypographySection({ sp }: { sp: StyleProps }) {
  const [more, setMore] = useState(false);
  const { data: fonts = [] } = useQuery({ queryKey: ["fonts"], queryFn: () => projectService.getFonts() });

  return (
    <Section title="Typography" actions={<MoreToggle open={more} onToggle={() => setMore((m) => !m)} label="More text options" />}>
      <FontFamilyPicker
        value={sp.values.fontFamily as string | undefined}
        onChange={(v) => sp.set("fontFamily", v)}
        fonts={fonts as string[]}
        className="h-[26px] text-[11px]"
      />
      <div className="grid grid-cols-2 gap-1.5">
        <StyleSelect sp={sp} k="fontWeight" label="Font weight" options={WEIGHTS} placeholder="Weight" />
        <StyleField sp={sp} k="fontSize" prefix="Aa" label="Font size" />
        <StyleField sp={sp} k="lineHeight" prefix="↕" label="Line height (unitless = × font size)" defaultUnit="" />
        <StyleField sp={sp} k="letterSpacing" prefix="↔" label="Letter spacing" />
      </div>
      <Segmented
        value={sp.values.textAlign as string | undefined}
        options={[
          { value: "left", label: <AlignLeft />, title: "Align left" },
          { value: "center", label: <AlignCenter />, title: "Align centre" },
          { value: "right", label: <AlignRight />, title: "Align right" },
          { value: "justify", label: <AlignJustify />, title: "Justify" },
        ]}
        onChange={(v) => sp.set("textAlign", v)}
        disabled={sp.disabled}
      />
      <ColorRow sp={sp} k="color" label="Text colour" />
      {more && (
        <div className="grid grid-cols-2 gap-1.5">
          <StyleSelect sp={sp} k="fontStyle" label="Font style" options={opts(["normal", "italic"])} placeholder="Style" />
          <StyleSelect sp={sp} k="textTransform" label="Text case" options={opts(["none", "uppercase", "lowercase", "capitalize"])} placeholder="Case" />
          <StyleSelect sp={sp} k="textDecoration" label="Decoration" options={opts(["none", "underline", "line-through", "overline"])} placeholder="Decoration" />
          <StyleSelect sp={sp} k="whiteSpace" label="White space" options={opts(["normal", "nowrap", "pre", "pre-wrap", "pre-line"])} placeholder="White space" />
          <StyleSelect sp={sp} k="textOverflow" label="Text overflow" options={opts(["clip", "ellipsis"])} placeholder="Overflow" />
          <StyleSelect sp={sp} k="wordBreak" label="Word break" options={opts(["normal", "break-all", "keep-all", "break-word"])} placeholder="Word break" />
          <StyleSelect sp={sp} k="wordWrap" label="Word wrap" options={opts(["normal", "break-word"])} placeholder="Word wrap" />
        </div>
      )}
    </Section>
  );
}
```

- [ ] **Step 2: Implement `FillSection.tsx`**

```tsx
import { Image as ImageIcon, X } from "lucide-react";
import { Section } from "./SectionHeader";
import { PropInput } from "./PropInput";
import { ColorRow } from "./ColorRow";
import { StyleSelect } from "./controls";
import { isSectionOn, SECTION_KEYS, sectionDefaults, toBackgroundImage } from "./styleModel";
import type { StyleProps } from "./useStyleProps";

const opts = (xs: string[]) => xs.map((v) => ({ value: v, label: v }));

export function FillSection({ sp }: { sp: StyleProps }) {
  const imageOn = isSectionOn(sp.values, "fillImage");
  return (
    <Section
      title="Fill"
      actions={
        !imageOn && !sp.disabled ? (
          <button
            type="button"
            title="Add background image"
            aria-label="Add background image"
            onClick={() => sp.setMany(sectionDefaults("fillImage"))}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </button>
        ) : undefined
      }
    >
      <ColorRow sp={sp} k="backgroundColor" label="Background colour" />
      {imageOn && (
        <>
          <div className="flex items-center gap-1">
            <PropInput
              value={sp.values.backgroundImage}
              placeholder="Image URL or gradient"
              prefix={<ImageIcon />}
              label="Background image"
              free
              onCommit={(v) => sp.set("backgroundImage", toBackgroundImage(v))}
              disabled={sp.disabled}
              className="flex-1"
            />
            {!sp.disabled && (
              <button
                type="button"
                aria-label="Remove background image"
                title="Remove background image"
                onClick={() => sp.clear(SECTION_KEYS.fillImage)}
                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1">
            <StyleSelect sp={sp} k="backgroundSize" label="Image size" options={opts(["cover", "contain", "auto"])} />
            <StyleSelect sp={sp} k="backgroundPosition" label="Image position" options={opts(["center", "top", "bottom", "left", "right"])} />
            <StyleSelect sp={sp} k="backgroundRepeat" label="Image repeat" options={opts(["no-repeat", "repeat", "repeat-x", "repeat-y"])} />
          </div>
        </>
      )}
    </Section>
  );
}
```

- [ ] **Step 3: Implement `BorderSection.tsx`**

```tsx
import { useState } from "react";
import { Section } from "./SectionHeader";
import { StyleField } from "./PropInput";
import { ColorRow } from "./ColorRow";
import { MoreToggle, StyleSelect } from "./controls";
import { isSectionOn, SECTION_KEYS, sectionDefaults } from "./styleModel";
import type { StyleProps } from "./useStyleProps";

const STYLES = ["solid", "dashed", "dotted", "double", "none"].map((v) => ({ value: v, label: v }));

export function BorderSection({ sp }: { sp: StyleProps }) {
  const [corners, setCorners] = useState(false);
  return (
    <Section
      title="Border"
      disabled={sp.disabled}
      optional={{
        on: isSectionOn(sp.values, "border"),
        onAdd: () => sp.setMany(sectionDefaults("border")),
        onRemove: () => sp.clear(SECTION_KEYS.border),
      }}
      actions={<MoreToggle open={corners} onToggle={() => setCorners((c) => !c)} label="Radius per corner" />}
    >
      <div className="grid grid-cols-2 gap-1.5">
        <StyleField sp={sp} k="borderWidth" prefix="W" label="Border width" />
        <StyleSelect sp={sp} k="borderStyle" label="Border style" options={STYLES} />
      </div>
      <ColorRow sp={sp} k="borderColor" label="Border colour" />
      {corners ? (
        <div className="grid grid-cols-4 gap-1">
          <StyleField sp={sp} k="borderTopLeftRadius" prefix="↖" label="Top-left radius" />
          <StyleField sp={sp} k="borderTopRightRadius" prefix="↗" label="Top-right radius" />
          <StyleField sp={sp} k="borderBottomRightRadius" prefix="↘" label="Bottom-right radius" />
          <StyleField sp={sp} k="borderBottomLeftRadius" prefix="↙" label="Bottom-left radius" />
        </div>
      ) : (
        <StyleField sp={sp} k="borderRadius" prefix="◜" label="Corner radius" />
      )}
    </Section>
  );
}
```

- [ ] **Step 4: Implement `ShadowSection.tsx`**

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Section } from "./SectionHeader";
import { StyleField } from "./PropInput";
import { isSectionOn, SECTION_KEYS, sectionDefaults, SHADOW_PRESETS } from "./styleModel";
import type { StyleProps } from "./useStyleProps";

export function ShadowSection({ sp }: { sp: StyleProps }) {
  const current = sp.values.boxShadow as string | undefined;
  const preset = SHADOW_PRESETS.find((p) => p.value === current)?.id ?? "custom";
  return (
    <Section
      title="Shadow"
      disabled={sp.disabled}
      optional={{
        on: isSectionOn(sp.values, "shadow"),
        onAdd: () => sp.setMany(sectionDefaults("shadow")),
        onRemove: () => sp.clear(SECTION_KEYS.shadow),
      }}
    >
      <Select
        value={preset}
        disabled={sp.disabled}
        onValueChange={(id) => {
          const p = SHADOW_PRESETS.find((x) => x.id === id);
          if (p) sp.set("boxShadow", p.value);
        }}
      >
        <SelectTrigger aria-label="Shadow preset" className="h-[26px]! rounded-[5px] border-transparent bg-muted/50 px-2! text-[11px]! shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SHADOW_PRESETS.map((p) => (
            <SelectItem key={p.id} value={p.id} className="text-xs">{p.label}</SelectItem>
          ))}
          <SelectItem value="custom" disabled className="text-xs">Custom</SelectItem>
        </SelectContent>
      </Select>
      <StyleField sp={sp} k="boxShadow" prefix="✱" label="Shadow (CSS box-shadow)" free />
    </Section>
  );
}
```

- [ ] **Step 5: Implement `EffectsSection.tsx`**

```tsx
import { Slider } from "@/components/ui/slider";
import { Section } from "./SectionHeader";
import { StyleField } from "./PropInput";
import { StyleSelect } from "./controls";
import { isSectionOn, SECTION_KEYS, sectionDefaults } from "./styleModel";
import type { StyleProps } from "./useStyleProps";

const opts = (xs: string[]) => xs.map((v) => ({ value: v, label: v }));

export function EffectsSection({ sp }: { sp: StyleProps }) {
  const opacity = Number(sp.values.opacity ?? sp.inherited.opacity ?? 1);
  const pct = Math.round((Number.isFinite(opacity) ? opacity : 1) * 100);
  return (
    <Section
      title="Effects"
      disabled={sp.disabled}
      optional={{
        on: isSectionOn(sp.values, "effects"),
        onAdd: () => sp.setMany(sectionDefaults("effects")),
        onRemove: () => sp.clear(SECTION_KEYS.effects),
      }}
    >
      <div className="flex h-[26px] items-center gap-2">
        <span className="w-12 shrink-0 text-[11px] text-muted-foreground">Opacity</span>
        <Slider
          aria-label="Opacity"
          min={0}
          max={100}
          step={1}
          value={[pct]}
          disabled={sp.disabled}
          onValueChange={([v]) => sp.set("opacity", v / 100)}
          className="flex-1"
        />
        <span className="w-8 text-right font-mono text-[11px] text-muted-foreground">{pct}%</span>
      </div>
      <StyleField sp={sp} k="transform" prefix="T" label="Transform (e.g. rotate(4deg) scale(1.05))" free />
      <StyleField sp={sp} k="transformOrigin" prefix="O" label="Transform origin" free />
      <StyleField sp={sp} k="filter" prefix="F" label="Filter (e.g. blur(4px))" free />
      <div className="grid grid-cols-2 gap-1.5">
        <StyleSelect sp={sp} k="overflow" label="Overflow" options={opts(["visible", "hidden", "scroll", "auto", "clip"])} placeholder="Overflow" />
        <StyleSelect sp={sp} k="cursor" label="Cursor" options={opts(["auto", "default", "pointer", "text", "move", "not-allowed", "grab"])} placeholder="Cursor" />
        <StyleSelect sp={sp} k="overflowX" label="Overflow X" options={opts(["visible", "hidden", "scroll", "auto", "clip"])} placeholder="Overflow X" />
        <StyleSelect sp={sp} k="overflowY" label="Overflow Y" options={opts(["visible", "hidden", "scroll", "auto", "clip"])} placeholder="Overflow Y" />
        <StyleSelect sp={sp} k="visibility" label="Visibility" options={opts(["visible", "hidden"])} placeholder="Visibility" />
        <StyleSelect sp={sp} k="boxSizing" label="Box sizing" options={opts(["border-box", "content-box"])} placeholder="Box sizing" />
      </div>
    </Section>
  );
}
```

- [ ] **Step 6: Implement `TailwindClassesEditor.tsx`**

This is the `TailwindAccordion` body without its accordion wrapper.

```tsx
import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useSelectedElement, useUpdateElement } from "@/features/editor";

export default function TailwindClassesEditor({ disabled }: { disabled?: boolean }) {
  const updateElement = useUpdateElement();
  const element = useSelectedElement();
  const [value, setValue] = useState(element?.tailwindStyles ?? "");
  const timer = useRef<number | null>(null);

  useEffect(() => setValue(element?.tailwindStyles ?? ""), [element?.id, element?.tailwindStyles]);
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  if (!element) return null;
  const commit = (v: string) => updateElement(element.id, { tailwindStyles: v });

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setValue(next);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      commit(next);
      timer.current = null;
    }, 250);
  };

  const count = value.trim().split(/\s+/).filter(Boolean).length;
  return (
    <div className="flex flex-col gap-1">
      <Textarea
        aria-label="Tailwind classes"
        value={value}
        disabled={disabled}
        onChange={onChange}
        onBlur={() => {
          if (timer.current) {
            window.clearTimeout(timer.current);
            timer.current = null;
          }
          commit(value);
        }}
        placeholder="p-4 rounded-lg hover:opacity-80"
        rows={3}
        className="min-h-[64px] resize-y rounded-[5px] border-transparent bg-muted/50 font-mono text-[11px]! leading-relaxed shadow-none"
      />
      <p className="text-[10px] text-muted-foreground">
        {count} {count === 1 ? "class" : "classes"} · overrides the fields above
      </p>
    </div>
  );
}
```

- [ ] **Step 7: Implement `AdvancedSection.tsx`**

```tsx
import React, { Suspense, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import TailwindClassesEditor from "./TailwindClassesEditor";

const CssTextareaImporter = React.lazy(() => import("../../editor/CssTextareaImporter"));

/** Collapsed by default: raw Tailwind classes and the project CSS importer. */
export function AdvancedSection({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="px-3 py-2.5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-5 w-full items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")} />
        Advanced
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-muted-foreground">Tailwind classes</span>
            <TailwindClassesEditor disabled={disabled} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-muted-foreground">Import CSS (project-wide)</span>
            <Suspense fallback={null}>
              <CssTextareaImporter />
            </Suspense>
          </div>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 8: Type-check**

Run: `npx tsc --noEmit`
Expected: clean. If `projectService.getFonts()` is typed as something other than `string[]`, keep the `as string[]` cast only at the `fonts=` prop.

- [ ] **Step 9: Commit**

```bash
git add src/features/editor/components/sidebar/style/
git commit -m "feat(style): typography, fill, border, shadow, effects and advanced sections"
```

---

### Task 5: StyleTab, breakpoint buttons, Inspector wiring

**Files:**
- Create: `style/StyleTab.tsx`, `style/BreakpointButtons.tsx`
- Modify: `src/features/editor/components/sidebar/Inspector.tsx`

**Interfaces:**
- Consumes: every section from Tasks 3–4; `useStyleProps`, `useStyleClipboard`, `BREAKPOINTS`, `isTextElement`.
- Produces:
  - `StyleTab({ breakpoint }: { breakpoint: Breakpoint })`;
  - `BreakpointButtons({ value, onChange }: { value: Breakpoint; onChange(b: Breakpoint): void })`.

- [ ] **Step 1: Implement `BreakpointButtons.tsx`**

```tsx
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BREAKPOINTS, type Breakpoint } from "./styleModel";

export function BreakpointButtons({ value, onChange }: { value: Breakpoint; onChange: (b: Breakpoint) => void }) {
  return (
    <div role="radiogroup" aria-label="Breakpoint" className="flex items-center gap-0.5">
      {BREAKPOINTS.map((b) => (
        <Tooltip key={b.id}>
          <TooltipTrigger asChild>
            <button
              type="button"
              role="radio"
              aria-checked={value === b.id}
              onClick={() => onChange(b.id)}
              className={cn(
                "h-6 rounded px-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground",
                value === b.id && "bg-muted text-foreground",
              )}
            >
              {b.label}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {b.label}: {b.minWidth}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Implement `StyleTab.tsx`**

```tsx
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BREAKPOINTS, isTextElement, type Breakpoint } from "./styleModel";
import { useStyleProps } from "./useStyleProps";
import { useStyleClipboard } from "./styleClipboard";
import { LayoutSection } from "./LayoutSection";
import { SpacingSection } from "./SpacingSection";
import { PositionSection } from "./PositionSection";
import { TypographySection } from "./TypographySection";
import { FillSection } from "./FillSection";
import { BorderSection } from "./BorderSection";
import { ShadowSection } from "./ShadowSection";
import { EffectsSection } from "./EffectsSection";
import { AdvancedSection } from "./AdvancedSection";

export default function StyleTab({ breakpoint }: { breakpoint: Breakpoint }) {
  const sp = useStyleProps(breakpoint);
  const copied = useStyleClipboard((s) => s.copied);
  const copy = useStyleClipboard((s) => s.copy);
  const element = sp.element;
  if (!element) return null;

  const bpLabel = BREAKPOINTS.find((b) => b.id === breakpoint)?.label ?? "Base";
  const name = element.name || element.type;

  return (
    // Keyed by element id so per-section UI state (⋯, per-side) resets on selection change.
    <div key={element.id} className="flex flex-col">
      <div className="flex h-9 items-center gap-2 border-b border-border/60 px-3">
        <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-medium text-sky-600 dark:text-sky-300">
          {element.type}
        </span>
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium">{name}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Style actions"
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs">
            <DropdownMenuItem onSelect={() => copy(sp.values)}>Copy styles ({bpLabel})</DropdownMenuItem>
            <DropdownMenuItem disabled={!copied || sp.disabled} onSelect={() => copied && sp.replace(copied)}>
              Paste styles
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={sp.disabled}
              onSelect={() => sp.replace({})}
              className="text-destructive focus:text-destructive"
            >
              Reset styles at {bpLabel}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <LayoutSection sp={sp} />
      <SpacingSection sp={sp} />
      <PositionSection sp={sp} />
      {isTextElement(element.type) && <TypographySection sp={sp} />}
      <FillSection sp={sp} />
      <BorderSection sp={sp} />
      <ShadowSection sp={sp} />
      <EffectsSection sp={sp} />
      <AdvancedSection disabled={sp.disabled} />
    </div>
  );
}
```

- [ ] **Step 3: Wire it into `Inspector.tsx`**

Replace the imports and the Style tab:

1. Remove the `Styles` and `CssTextareaImporter` lazy imports, and the `Collapsible`/`ChevronDown` imports if they are now unused.
2. Add:

```tsx
import { useState } from "react";
import { BreakpointButtons } from "./style/BreakpointButtons";
import type { Breakpoint } from "./style/styleModel";

const StyleTab = React.lazy(() => import("./style/StyleTab"));
```

3. In `Inspector()`, add tab and breakpoint state:

```tsx
const [tab, setTab] = useState<"style" | "settings">("style");
const [breakpoint, setBreakpoint] = useState<Breakpoint>("default");
```

4. Make `<Tabs>` controlled: `value={tab} onValueChange={(v) => setTab(v as "style" | "settings")}`. Replace the `<span className="flex-1" />` spacer in the tab bar with:

```tsx
<span className="flex-1" />
{tab === "style" && <BreakpointButtons value={breakpoint} onChange={setBreakpoint} />}
```

5. Replace the whole `<TabsContent value="style" …>…</TabsContent>` block with:

```tsx
<TabsContent value="style" className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
  <Suspense fallback={<Fallback />}>
    <StyleTab breakpoint={breakpoint} />
  </Suspense>
</TabsContent>
```

6. Keep `DENSE` on the Settings `TabsContent` only.

- [ ] **Step 4: Type-check, test and build**

Run: `npx tsc --noEmit && bun run test:unit && bun run build`
Expected: all three succeed.

- [ ] **Step 5: Commit**

```bash
git add src/features/editor/components/sidebar/
git commit -m "feat(style): new Style tab with breakpoint buttons in the inspector"
```

---

### Task 6: Remove the old Style tab code and verify

**Files:**
- Delete (each only after its grep shows no importers outside the deleted set):
  - `configurations/Styles.tsx`, `AppearanceAccordion.tsx`, `TypographyAccordion.tsx`, `TailwindAccordion.tsx`, `BreakpointSelector.tsx`;
  - `configurations/_shared/SpacingBoxModel.tsx`, `BorderBoxModel.tsx`, `PositionSection.tsx`, `SliderField.tsx`, `ColorPickerField.tsx`, `TypographyPanel.tsx`;
  - `configurations/_shared/display/*`, except `AlignmentMatrix.tsx` and `types.ts`.
- Modify: `configurations/_shared/index.ts` and `_shared/display/index.ts`, removing the deleted exports.

- [ ] **Step 1: List the importers of every candidate**

Run:

```bash
cd src/features/editor/components/sidebar/configurations
for f in Styles AppearanceAccordion TypographyAccordion TailwindAccordion BreakpointSelector SpacingBoxModel BorderBoxModel PositionSection SliderField ColorPickerField TypographyPanel DisplaySection CompactInput CompactPaddingRow DisplayModeToggle FlexDirectionToggle GapControls SizeRow WrapToggle ClipContentCheck; do
  echo "== $f"; grep -rln "\b$f\b" ../../../../../ --include=*.ts --include=*.tsx | grep -v "/$f.tsx$"
done
```

Expected: each candidate's only hits are other candidates or the two `index.ts` barrels. A candidate with any other importer (e.g. a Settings configuration that uses `ColorPickerField` or `SliderField`) is **kept**; note it in the commit message.

- [ ] **Step 2: Delete the unreferenced files and remove their barrel exports**

Use `git rm` on the files cleared in Step 1. Edit `_shared/index.ts` and `_shared/display/index.ts` to drop the export lines for the deleted modules (and the type exports, such as `TypographyValues`, that only they used).

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && bun run test:unit && bun run build`
Expected: all three succeed. A missing-module error means a file was deleted that something still imports: restore it with `git checkout -- <file>` and keep it.

- [ ] **Step 4: Commit**

```bash
git add -A src/features/editor/components/sidebar/configurations
git commit -m "refactor(style): remove the old accordion Style tab"
```

- [ ] **Step 5: Manual browser check (user)**

On http://localhost:3000, open a project and check:

1. **Section element:** Layout display switches. In Flex, direction, gap, wrap and the alignment matrix work. W/H accept `100%`, `auto` and `calc(100% - 2rem)`; `12qx` shows a red ring and reverts on blur.
2. **Scrubbing and stepping:** dragging the `W` prefix changes the value. ↑/↓ step by 1, and Shift+↑ by 10.
3. **Spacing:** x/y edit both sides. The per-side toggle shows T R B L, and an element imported with `padding: 8px 16px` shows 16/8.
4. **Border, Shadow, Effects:** `+` adds the defaults and the canvas updates. `−` removes them, and one Undo restores them.
5. **Text and Button elements:** Typography appears; it's absent on Image.
6. **Breakpoints:** on MD, change the width. A blue dot appears and Base's value shows as the placeholder elsewhere. Clicking the dot clears it.
7. **`⋯` menu:** Copy, then Paste onto another element, then Reset.
8. **Overflow:** no horizontal scrollbar at 280px.

---

## Self-review notes

- **Spec coverage:**
  - tab bar and breakpoints: Task 5;
  - selection row and `⋯`: Task 5;
  - every section in the spec table: Tasks 3–4, with Position simplified and recorded in the spec in Task 1;
  - optional `+`/`−`: Tasks 2 and 4;
  - inputs (scrub, step, validate, free text, tooltips): Task 2;
  - colour alpha: Tasks 1 and 2;
  - spacing collapse/expand and shorthand: Tasks 1 and 3;
  - breakpoint dot and inherited placeholder: Task 2 (`StyleField`, `ColorRow`, `StyleSelect`);
  - read-only/locked: `useStyleProps.disabled`, which is passed to every control and hides `+`/`−`;
  - removal with grep: Task 6;
  - tests: Tasks 1–2.
- **Types:** `StyleProps`, `StyleMap`, `Breakpoint` and `OptionalSection` are used consistently, and `sp.set/setMany/replace/clear` keep the same names everywhere.
