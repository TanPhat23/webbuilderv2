import { create } from "zustand";
import type { Breakpoint } from "@webbuilder/site-runtime/types/elements";
import type { Viewport } from "../context/EditorContext";

export type ViewportPreset = "mobile" | "tablet" | "desktop";
export type ZoomMode = "fit" | "manual";

export const STAGE_HORIZONTAL_GUTTER_PX = 64;
export const STAGE_TOP_GUTTER_PX = 40;
export const STAGE_BOTTOM_GUTTER_PX = 32;
export const MIN_FRAME_WIDTH_PX = 320;
export const MAX_FRAME_WIDTH_PX = 2560;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 2.0;

export const PRESET_WIDTHS: Readonly<Record<ViewportPreset, number>> = {
  mobile: 375,
  tablet: 768,
  desktop: 1440,
};

const BREAKPOINT_MIN_WIDTH: Readonly<Record<Breakpoint, number | null>> = {
  default: null,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

/** A point in stage-local pixels (origin at the stage's top-left corner). */
export interface StagePoint {
  readonly x: number;
  readonly y: number;
}

export interface CanvasViewportData {
  readonly frameWidthPx: number;
  readonly preset: ViewportPreset | "custom";
  readonly activeBreakpoint: Breakpoint;
  readonly zoomMode: ZoomMode;
  readonly manualZoom: number;
  readonly stageWidthPx: number;
  readonly stageHeightPx: number;
  readonly panX: number;
  readonly panY: number;
}

export interface CanvasViewportStoreState extends CanvasViewportData {
  setPreset: (preset: ViewportPreset) => void;
  scrubFrameWidth: (widthPx: number) => void;
  setActiveBreakpoint: (bp: Breakpoint) => void;
  setStageBounds: (widthPx: number, heightPx: number) => void;
  /**
   * Zooms by a wheel delta. With a stage-local `anchor`, pan is adjusted so
   * the page point under that cursor stays fixed on screen.
   */
  zoomByWheel: (deltaY: number, anchor?: StagePoint) => void;
  setManualZoom: (zoom: number) => void;
  resetZoomToFit: () => void;
  panBy: (dx: number, dy: number) => void;
  resetViewport: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function frameLeft(
  s: Pick<CanvasViewportData, "frameWidthPx" | "stageWidthPx" | "panX">,
  zoom: number,
): number {
  return (s.stageWidthPx - s.frameWidthPx * zoom) / 2 + s.panX;
}

function frameTop(s: Pick<CanvasViewportData, "panY">): number {
  return STAGE_TOP_GUTTER_PX + s.panY;
}

export function computeFitZoom(frameWidthPx: number, stageWidthPx: number): number {
  if (stageWidthPx <= STAGE_HORIZONTAL_GUTTER_PX || frameWidthPx <= 0) return 1;
  const available = stageWidthPx - STAGE_HORIZONTAL_GUTTER_PX;
  return clamp(Math.min(1, available / frameWidthPx), MIN_ZOOM, 1);
}

export function computeEffectiveZoom(
  state: Pick<CanvasViewportStoreState, "zoomMode" | "manualZoom" | "frameWidthPx" | "stageWidthPx">,
): number {
  return state.zoomMode === "manual"
    ? clamp(state.manualZoom, MIN_ZOOM, MAX_ZOOM)
    : computeFitZoom(state.frameWidthPx, state.stageWidthPx);
}

export function minWidthForBreakpoint(bp: Breakpoint): number | null {
  return BREAKPOINT_MIN_WIDTH[bp];
}

export function breakpointForScrubbedWidth(
  widthPx: number,
  currentBp: Breakpoint,
): Breakpoint {
  if (widthPx < 640) return "default";
  if (widthPx < 768) return "sm";
  if (widthPx < 1024) return "md";
  if (widthPx < 1280) return "lg";
  return currentBp === "xl" ? "xl" : "default";
}

export function viewportFromState(
  state: Pick<CanvasViewportStoreState, "preset" | "frameWidthPx">,
): Viewport {
  if (state.preset !== "custom") return state.preset;
  if (state.frameWidthPx < 640) return "mobile";
  if (state.frameWidthPx < 1024) return "tablet";
  return "desktop";
}

const INITIAL_DATA: CanvasViewportData = {
  frameWidthPx: 1440,
  preset: "desktop",
  activeBreakpoint: "default",
  zoomMode: "fit",
  manualZoom: 1,
  stageWidthPx: 1200,
  stageHeightPx: 800,
  panX: 0,
  panY: 0,
};

export const useCanvasViewportStore = create<CanvasViewportStoreState>((set) => ({
  ...INITIAL_DATA,

  setPreset: (preset) =>
    set({
      preset,
      frameWidthPx: PRESET_WIDTHS[preset],
      activeBreakpoint: preset === "tablet" ? "md" : "default",
      panX: 0,
      panY: 0,
    }),

  scrubFrameWidth: (widthPx) =>
    set((s) => {
      const clamped = Math.round(clamp(widthPx, MIN_FRAME_WIDTH_PX, MAX_FRAME_WIDTH_PX));
      return {
        preset: "custom",
        frameWidthPx: clamped,
        activeBreakpoint: breakpointForScrubbedWidth(clamped, s.activeBreakpoint),
      };
    }),

  setActiveBreakpoint: (bp) =>
    set((s) => {
      const minW = minWidthForBreakpoint(bp);
      const nextWidth = minW !== null && s.frameWidthPx < minW ? minW : s.frameWidthPx;
      const nextPreset = nextWidth === s.frameWidthPx ? s.preset : "custom";
      return {
        activeBreakpoint: bp,
        frameWidthPx: nextWidth,
        preset: nextPreset,
      };
    }),

  setStageBounds: (widthPx, heightPx) =>
    set((s) =>
      s.stageWidthPx === widthPx && s.stageHeightPx === heightPx
        ? s
        : { stageWidthPx: widthPx, stageHeightPx: heightPx },
    ),

  zoomByWheel: (deltaY, anchor) =>
    set((s) => {
      const base = computeEffectiveZoom(s);
      const next = clamp(base * Math.exp(-deltaY * 0.0015), MIN_ZOOM, MAX_ZOOM);
      const zoom = Math.round(next * 1000) / 1000;
      if (!anchor || zoom === base) {
        return { zoomMode: "manual", manualZoom: zoom };
      }
      // frame.left = (stageW - frameW * zoom) / 2 + panX and frame.top =
      // TOP_GUTTER + panY, so solving "the page point under the anchor does
      // not move" for the pan gives the two lines below.
      const pageX = (anchor.x - frameLeft(s, base)) / base;
      const pageY = (anchor.y - frameTop(s)) / base;
      const nextLeft = anchor.x - pageX * zoom;
      const nextTop = anchor.y - pageY * zoom;
      return {
        zoomMode: "manual",
        manualZoom: zoom,
        panX: nextLeft - (s.stageWidthPx - s.frameWidthPx * zoom) / 2,
        panY: nextTop - STAGE_TOP_GUTTER_PX,
      };
    }),

  setManualZoom: (zoom) =>
    set({
      zoomMode: "manual",
      manualZoom: clamp(zoom, MIN_ZOOM, MAX_ZOOM),
    }),

  resetZoomToFit: () => set({ zoomMode: "fit", panX: 0, panY: 0 }),

  panBy: (dx, dy) =>
    set((s) => {
      const zoom = computeEffectiveZoom(s);
      const maxPanX = Math.max(240, Math.round(s.frameWidthPx * zoom * 0.75));
      const maxPanY = Math.max(240, Math.round(s.stageHeightPx * 0.75));
      return {
        panX: clamp(s.panX + dx, -maxPanX, maxPanX),
        panY: clamp(s.panY + dy, -maxPanY, maxPanY),
      };
    }),

  resetViewport: () => set(INITIAL_DATA),
}));
