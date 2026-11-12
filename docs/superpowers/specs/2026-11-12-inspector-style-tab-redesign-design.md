# Inspector Style tab redesign

Date: 2026-11-12 · Branch: `editor-redesign` · Status: approved direction (option B)

## Goal

Replace the inspector's Style tab with a compact, Figma-style property panel
that fits the 280px inspector without overflow. Hide properties the element
doesn't use, and keep every property the current tab can edit.

## Why

The current tab (`sidebar/configurations/Styles.tsx` → `AppearanceAccordion`,
`TypographyAccordion`, `TailwindAccordion`) has several problems:

- It nests an "Appearance" accordion with 12 always-open sub-sections.
- Empty diagrams (border box, margin/padding box) take up space even when unset.
- Labels and controls are a mix of fixed widths, and some rows overflowed 260–280px.
- Typography shows only for `Text`.

## Non-goals

- No change to the data model. Styles stay `element.styles[breakpoint]`
  (`React.CSSProperties`) and every write still goes through
  `elementHelper.updateElementStyle`. Tailwind sync and collab are unchanged.
- No change to the Settings tab or to the `_shared` primitives it imports
  (`ConfigField`, `ConfigEmpty`, `SectionDivider`, `ToggleGroupField`, …).
- No new style properties beyond what the current tab edits.

## Layout

```
┌ Style │ Settings          Base SM MD LG XL ┐   tab bar (breakpoints moved here)
├ [Section] hero                         ⋯ ┤   selection row
├ Layout                                     ┤
│  [Block|Flex|Grid|None]                    │
│  [→|↓] [⇔ 16] [wrap]   (flex only)         │
│  alignment matrix       (flex only)        │
│  [W 100 %] [H Auto]   ⋯ min/max            │
├ Spacing                              [⊞]   ┤   ⊞ = per-side toggle
│  [↔ 32 pad x] [↕ 24 pad y]                 │
│  [↔ 0 mar x]  [↕ 0 mar y]                  │
├ Position                                   ┤
│  [Static ▾] [Z auto]                       │
├ Typography              (text elements)    ┤
├ Fill                                   +   ┤
│  [■ FFFFFF        100%]                    │
├ Border                                 +   ┤   collapsed until set
├ Shadow                                 +   ┤   collapsed until set
├ Effects                                +   ┤   collapsed until set
└ Advanced                               ▸   ┘   classes + Import CSS
```

### Tab bar and selection row

- The tab bar shows `Style | Settings`. The five breakpoint buttons sit on the
  right side of the bar; they replace the separate `BreakpointSelector` bar.
  The active breakpoint is highlighted, and each button has a tooltip with its
  min-width.
- The selection row (Style tab only) holds:
  - a type chip (`Section`);
  - the element name (`element.name`, falling back to the type);
  - a `⋯` menu with **Reset styles at this breakpoint**, **Copy styles** and
    **Paste styles**. Copy and paste use an in-memory clipboard in a dedicated zustand
    store, not the system clipboard.

### Sections

| Section | Properties | Visibility |
|---|---|---|
| Layout | `display`. Flex: `flexDirection`, `gap`/`rowGap`/`columnGap`, `flexWrap`, `justifyContent`, `alignItems`. Grid: `gridTemplateColumns`, `gridTemplateRows`, `gap`. Always: `width`, `height`, and behind `⋯`: `minWidth`, `maxWidth`, `minHeight`, `maxHeight`, `aspectRatio`, `objectFit`. Child-of-flex extras behind `⋯`: `alignSelf`, `flexGrow`, `flexShrink`, `flexBasis`, `order`. | Always |
| Spacing | `padding*`, `margin*` | Always |
| Position | `position`, `zIndex`. When not static: `top`/`right`/`bottom`/`left`, using four compact T/R/B/L fields. | Always |
| Typography | Font family (existing `FontFamilyPicker`), `fontWeight`, `fontSize`, `lineHeight`, `letterSpacing`, `textAlign`, `color`, `textTransform`, `textDecoration` | Element type in `EDITABLE_ELEMENT_TYPES` |
| Fill | `backgroundColor`, plus an optional image row: `backgroundImage`, `backgroundSize`, `backgroundPosition`, `backgroundRepeat` | Always; `+` adds the image row |
| Border | `borderWidth`, `borderStyle`, `borderColor`, `borderRadius` and the four corner radii | Optional |
| Shadow | `boxShadow` (preset dropdown, plus a custom text value) | Optional |
| Effects | `opacity`, `transform`, `transformOrigin`, `filter`, `cursor`, `overflow`/`overflowX`/`overflowY`, `visibility`, `boxSizing` | Optional |
| Advanced | The current `TailwindAccordion` contents and the `CssTextareaImporter` (moved in from `Inspector.tsx`) | Collapsed by default |

Text-overflow properties (`textOverflow`, `whiteSpace`, `wordBreak`,
`wordWrap`) go in Typography behind `⋯`.

### Optional sections (`+` / `−`)

- A section is **on** when any of its keys has a value at the current breakpoint.
- An **off** section renders only as a header row with `+`.
- Clicking `+` turns it on with these defaults, written in one batch:
  - Border: `borderWidth: 1px`, `borderStyle: solid`, `borderColor: currentColor`.
  - Shadow: the "sm" preset.
  - Effects: `opacity: 1`.
  - Fill image: `backgroundSize: cover`, `backgroundPosition: center`,
    `backgroundRepeat: no-repeat`; the URL field is then focused.
- Clicking `−` on an on section removes all of its keys from the current
  breakpoint in one batch, so it's undoable as one step.

### Inputs

One shared `PropInput`:

- 28px tall, with a prefix (icon or one or two letters) and an optional unit suffix.
- Scrubbing: dragging the prefix horizontally changes the number by 1 per
  2px (Shift for ×10, Alt for ×0.1). ↑/↓ step by 1 (Shift ×10).
- Commits on Enter or blur; Escape reverts. Keyword values (`auto`, `none`,
  `inherit`, `fit-content`, …) and any CSS length are accepted as typed.
- Plain numbers get the field's default unit (`px`, or none for `zIndex`,
  `opacity`, `flexGrow`, `fontWeight` and `lineHeight`).
- The prefix tooltip names the property in plain words. That text replaces
  today's per-field Info icons.

Colour rows use a swatch (native picker), hex text and an opacity %. Opacity
is stored by writing `rgba()`/8-digit hex only when it is below 100%.

### Spacing

- In collapsed mode, each of padding and margin shows two fields: x (left and
  right) and y (top and bottom). Editing x writes both `*Left` and `*Right`.
- The `⊞` toggle switches to four fields per property (T R B L).
- The panel opens in four-field mode automatically when the stored sides
  differ (e.g. `paddingLeft ≠ paddingRight`).
- The shorthand `padding`/`margin`, if present, is read as the fallback for
  unset sides. On first edit it is expanded to longhands and removed.

### Breakpoint overrides

- A field whose key is set at the current (non-Base) breakpoint shows a small
  blue dot before its prefix. Clicking the dot removes that key at this breakpoint.
- Fields not set at the current breakpoint show the inherited Base value as
  placeholder text.

## Architecture

New folder `src/features/editor/components/sidebar/style/`:

- `StyleTab.tsx`: the selection row and section list, with breakpoint state
  lifted from `Styles.tsx`.
- `useStyleProps.ts`: given the element and breakpoint, returns `values`,
  `inherited` (Base, when not on Base), `set(key, value)`, `setMany(partial)`
  and `clear(keys)`. Every write goes through `elementHelper.updateElementStyle`.
- `styleModel.ts`: pure helpers with no React, so they can be unit-tested:
  - `parseCssValue` / `formatCssValue` (number + unit ⇄ string);
  - `SECTION_KEYS` and `isSectionOn(styles, section)`;
  - `sectionDefaults`;
  - `withoutKeys(styles, keys)`;
  - `readSides(styles, "padding" | "margin")` and `sidesDiffer`;
  - `writeAxis(...)` / `writeSide(...)`, including shorthand expansion;
  - `isTextElement(type)`.
- `PropInput.tsx`, `ColorRow.tsx`, `SectionHeader.tsx` (title, `+`/`−`, `⋯` slot).
- One file per section: `LayoutSection`, `SpacingSection`, `PositionSection`
  (four compact T/R/B/L fields), `TypographySection`,
  `FillSection`, `BorderSection`, `ShadowSection`, `EffectsSection`,
  `AdvancedSection`.

Reused as-is: `_shared/FontFamilyPicker`,
the `TailwindAccordion` body, extracted into `TailwindClassesEditor`.

Wiring:

- `Inspector.tsx` renders `<StyleTab/>` in the Style tab and drops its own
  Import CSS collapsible and the `DENSE` override for that tab. Settings keeps
  `DENSE`.
- The breakpoint buttons render in the inspector tab bar only while Style is
  active.

Removed after the switch, but only once nothing imports them:

- `Styles.tsx`, `AppearanceAccordion.tsx`, `TypographyAccordion.tsx`, `BreakpointSelector.tsx`;
- the Style-only `_shared` pieces: `SpacingBoxModel`, `BorderBoxModel`,
  `PositionSection`, `display/*` other than
  `AlignmentMatrix`, `TypographyPanel`.
- `SliderField` and `ColorPickerField` remain because Settings uses them.

Each removal is checked with a grep for importers first.

## Error handling and edge cases

- An invalid typed value (e.g. `12qx`) is not written. The field shows a red
  ring and reverts on blur.
- With no element selected, the Style tab is not shown (unchanged: the
  inspector shows page properties).
- Locked or read-only elements render every control disabled, and the `+`/`−`
  buttons are hidden.
- Changing the selection resets scrubbing and drafts. Each section's local UI
  state (per-side toggle, `⋯` expanders) is keyed by element id.

## Testing

`tests/style-model.test.ts` (node:test) covers:

- `parseCssValue`: `"16px"`, `"1.5rem"`, `"100%"`, `"auto"`, `"0"`, `""`, `"12qx"` (invalid).
- `isSectionOn` for each optional section, including the off case with
  unrelated keys set.
- `withoutKeys` removes only that section's keys.
- `readSides` with longhands only, shorthand only, mixed, and `sidesDiffer`.
- `writeAxis` expands a shorthand and removes it.
- `isTextElement` for a text type, a container and an image.

Manual browser check: every section on a Section, Text, Image and Button
element; `+` then `−` round-trips; per-breakpoint dots; scrub and arrow keys;
no horizontal overflow at 280px.

## Visual refinement after screenshot review

The panel uses 28px controls with 12px values and restrained 5px corner radii. A dedicated 68px `AlignmentControl` sits beside direction, gap and wrap, rather than spanning the panel. Row and column gap controls live under Layout's more options. Spacing has explicit Padding and Margin labels; per-side mode uses two columns so values and units remain legible. Color expressions preserve their original case. Inspector tabs use the line variant. Both dark and light appearances are captured by `bun run test:style-controls`.
