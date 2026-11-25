import type { ResponsiveStyles } from "@/types/elements";

export type SpacingSide = "top" | "right" | "bottom" | "left";

export type SideSpacingHandleId =
  | `padding-${SpacingSide}`
  | `margin-${SpacingSide}`;

export type SpacingHandleId = SideSpacingHandleId | "gap";

export type GapAxis = "horizontal" | "vertical";

export interface ComputedSpacing {
  readonly padding: Readonly<Record<SpacingSide, number>>;
  readonly margin: Readonly<Record<SpacingSide, number>>;
  readonly gap: number;
  readonly gapAxis: GapAxis;
}

export interface SpacingPreview {
  readonly kind: "padding" | "margin" | "gap";
  readonly activeSides: readonly SpacingSide[];
  readonly padding: Readonly<Record<SpacingSide, number>>;
  readonly margin: Readonly<Record<SpacingSide, number>>;
  readonly gap: number;
  readonly label: string;
  readonly styles: ResponsiveStyles;
}

const ALL_SIDES: readonly SpacingSide[] = ["top", "right", "bottom", "left"];

const OPPOSITE_SIDE: Readonly<Record<SpacingSide, SpacingSide>> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

const HANDLE_META: Readonly<
  Record<
    SideSpacingHandleId,
    { readonly kind: "padding" | "margin"; readonly side: SpacingSide }
  >
> = {
  "padding-top": { kind: "padding", side: "top" },
  "padding-right": { kind: "padding", side: "right" },
  "padding-bottom": { kind: "padding", side: "bottom" },
  "padding-left": { kind: "padding", side: "left" },
  "margin-top": { kind: "margin", side: "top" },
  "margin-right": { kind: "margin", side: "right" },
  "margin-bottom": { kind: "margin", side: "bottom" },
  "margin-left": { kind: "margin", side: "left" },
};

const PADDING_PROP: Readonly<
  Record<SpacingSide, "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft">
> = {
  top: "paddingTop",
  right: "paddingRight",
  bottom: "paddingBottom",
  left: "paddingLeft",
};

const MARGIN_PROP: Readonly<
  Record<SpacingSide, "marginTop" | "marginRight" | "marginBottom" | "marginLeft">
> = {
  top: "marginTop",
  right: "marginRight",
  bottom: "marginBottom",
  left: "marginLeft",
};

const SIDE_SHORT: Readonly<Record<SpacingSide, string>> = {
  top: "T",
  right: "R",
  bottom: "B",
  left: "L",
};

const SNAP_STEP_PX = 4;

function parsePx(raw: string | undefined): number {
  if (!raw) return 0;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

function isMultiColumnGrid(
  style: Pick<CSSStyleDeclaration, "display" | "gridTemplateColumns">,
): boolean {
  if (!style.display.includes("grid")) return false;
  const tracks = (style.gridTemplateColumns ?? "")
    .trim()
    .split(/\s+/)
    .filter((t) => t && t !== "none");
  return tracks.length > 1;
}

export function readComputedSpacing(
  style: Pick<
    CSSStyleDeclaration,
    | "paddingTop"
    | "paddingRight"
    | "paddingBottom"
    | "paddingLeft"
    | "marginTop"
    | "marginRight"
    | "marginBottom"
    | "marginLeft"
    | "gap"
    | "rowGap"
    | "columnGap"
    | "display"
    | "flexDirection"
    | "gridTemplateColumns"
  >,
): ComputedSpacing {
  const horizontal =
    (style.display.includes("flex") && style.flexDirection.startsWith("row")) ||
    isMultiColumnGrid(style);
  const gapAxis: GapAxis = horizontal ? "horizontal" : "vertical";
  const rawGap =
    parsePx(style.gap) ||
    (gapAxis === "horizontal" ? parsePx(style.columnGap) : parsePx(style.rowGap));

  return {
    padding: {
      top: parsePx(style.paddingTop),
      right: parsePx(style.paddingRight),
      bottom: parsePx(style.paddingBottom),
      left: parsePx(style.paddingLeft),
    },
    margin: {
      top: parsePx(style.marginTop),
      right: parsePx(style.marginRight),
      bottom: parsePx(style.marginBottom),
      left: parsePx(style.marginLeft),
    },
    gap: rawGap,
    gapAxis,
  };
}

export function spacingCursor(handle: SpacingHandleId, gapAxis: GapAxis): string {
  if (handle === "gap") return gapAxis === "horizontal" ? "ew-resize" : "ns-resize";
  const { side } = HANDLE_META[handle];
  return side === "top" || side === "bottom" ? "ns-resize" : "ew-resize";
}

function sideDelta(
  kind: "padding" | "margin",
  side: SpacingSide,
  dx: number,
  dy: number,
): number {
  const inward =
    side === "top" ? dy : side === "bottom" ? -dy : side === "left" ? dx : -dx;
  return kind === "padding" ? inward : -inward;
}

function clampAndSnap(value: number, snap: boolean): number {
  const nonNegative = Math.max(0, Math.round(value));
  return snap
    ? Math.max(0, Math.round(nonNegative / SNAP_STEP_PX) * SNAP_STEP_PX)
    : nonNegative;
}

export function computeSpacingPreview(
  handle: SpacingHandleId,
  initial: ComputedSpacing,
  delta: {
    readonly dx: number;
    readonly dy: number;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
  },
  currentStyles: ResponsiveStyles | undefined,
): SpacingPreview {
  const base = currentStyles ?? { default: {} };
  const nextDefault: NonNullable<ResponsiveStyles["default"]> = { ...base.default };

  if (handle === "gap") {
    const raw = initial.gap + (initial.gapAxis === "horizontal" ? delta.dx : delta.dy);
    const gap = clampAndSnap(raw, delta.shiftKey);
    nextDefault.gap = `${gap}px`;
    return {
      kind: "gap",
      activeSides: [],
      padding: initial.padding,
      margin: initial.margin,
      gap,
      label: `Gap ${gap}px`,
      styles: { ...base, default: nextDefault },
    };
  }

  const { kind, side } = HANDLE_META[handle];
  const activeSides: readonly SpacingSide[] =
    delta.altKey && delta.shiftKey
      ? ALL_SIDES
      : delta.altKey
        ? [side, OPPOSITE_SIDE[side]]
        : [side];

  const startValue = initial[kind][side];
  const nextValue = clampAndSnap(
    startValue + sideDelta(kind, side, delta.dx, delta.dy),
    delta.shiftKey,
  );

  const nextPadding: Record<SpacingSide, number> = { ...initial.padding };
  const nextMargin: Record<SpacingSide, number> = { ...initial.margin };
  const targetRecord = kind === "padding" ? nextPadding : nextMargin;
  const propMap = kind === "padding" ? PADDING_PROP : MARGIN_PROP;

  for (const s of activeSides) {
    targetRecord[s] = nextValue;
    nextDefault[propMap[s]] = `${nextValue}px`;
  }

  const title = kind === "padding" ? "Padding" : "Margin";
  const sideTag =
    activeSides.length === 4
      ? "All"
      : activeSides.map((s) => SIDE_SHORT[s]).join("/");

  return {
    kind,
    activeSides,
    padding: nextPadding,
    margin: nextMargin,
    gap: initial.gap,
    label: `${title} ${sideTag} ${nextValue}px`,
    styles: { ...base, default: nextDefault },
  };
}
