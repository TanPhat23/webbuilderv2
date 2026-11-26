import type React from "react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { compileElementStylesCss } from "@webbuilder/site-runtime/elements/lib/compileElementStylesCss";
import { sanitizeProjectCss } from "@webbuilder/site-runtime/projects/project-css";
import { useCollaborationOptional } from "@/features/collaboration/context/CollaborationContext";
import { useProjectTailwindCss } from "@/features/projects/hooks/useProjectTailwindCss";
import {
  STAGE_BOTTOM_GUTTER_PX,
  STAGE_TOP_GUTTER_PX,
  computeEffectiveZoom,
  useCanvasViewportStore,
  type CanvasViewportData,
} from "@/features/editor/store/canvas-viewport-store";
import type { CanvasSiteHandlers } from "./useCanvasController";

export const SITE_ROOT_ID = "wb-site-root";
export const TAILWIND_STYLE_ID = "wb-tailwind-css";
export const ELEMENT_STYLES_STYLE_ID = "wb-element-styles";
export const PROJECT_STYLE_ID = "wb-project-css";

/**
 * Editor-only rules for the site document: the dragged node ghost, the pick
 * crosshair, and click-through for nested component preview frames.
 */
export const CANVAS_INTERACTION_CSS = [
  '[data-dragging="true"]{opacity:.35}',
  "[data-picking],[data-picking] *{cursor:crosshair!important}",
  "[data-component-instance] iframe{pointer-events:none}",
].join("");

/**
 * The static document shell of the preview iframe: no editor stylesheets, no
 * wrapper padding. Everything else (Tailwind, element and project CSS) is
 * written into the three style elements in place, so the srcdoc never changes
 * and the iframe never reloads.
 */
export const SITE_IFRAME_SRCDOC = [
  "<!doctype html><html><head>",
  '<meta charset="utf-8" />',
  '<meta name="viewport" content="width=device-width, initial-scale=1" />',
  "<style>html,body{margin:0;padding:0;min-height:100%;overflow-x:hidden}",
  "#wb-site-root{min-height:100vh;width:100%;margin:0;padding:0}</style>",
  `<style id="${TAILWIND_STYLE_ID}"></style>`,
  `<style id="${ELEMENT_STYLES_STYLE_ID}"></style>`,
  `<style id="${PROJECT_STYLE_ID}"></style>`,
  `</head><body><div id="${SITE_ROOT_ID}"></div></body></html>`,
].join("");

export interface FrameLayoutInput
  extends Pick<
    CanvasViewportData,
    | "frameWidthPx"
    | "zoomMode"
    | "manualZoom"
    | "stageWidthPx"
    | "stageHeightPx"
    | "panX"
    | "panY"
  > {}

/** Where the scaled frame sits inside the stage, in stage pixels. */
export interface FrameLayout {
  readonly zoom: number;
  readonly left: number;
  readonly top: number;
  /** Unscaled iframe size in CSS px. */
  readonly width: number;
  readonly height: number;
  /** On-screen size after the zoom transform. */
  readonly scaledWidth: number;
  readonly scaledHeight: number;
}

export function computeFrameLayout(input: FrameLayoutInput): FrameLayout {
  const zoom = computeEffectiveZoom(input);
  const scaledWidth = input.frameWidthPx * zoom;
  const scaledHeight = Math.max(
    0,
    input.stageHeightPx - STAGE_TOP_GUTTER_PX - STAGE_BOTTOM_GUTTER_PX,
  );
  return {
    zoom,
    left: (input.stageWidthPx - scaledWidth) / 2 + input.panX,
    top: STAGE_TOP_GUTTER_PX + input.panY,
    width: input.frameWidthPx,
    height: scaledHeight / zoom,
    scaledWidth,
    scaledHeight,
  };
}

/** The frame layout for the current viewport store state. */
export function useFrameLayout(): FrameLayout {
  const frameWidthPx = useCanvasViewportStore((s) => s.frameWidthPx);
  const zoomMode = useCanvasViewportStore((s) => s.zoomMode);
  const manualZoom = useCanvasViewportStore((s) => s.manualZoom);
  const stageWidthPx = useCanvasViewportStore((s) => s.stageWidthPx);
  const stageHeightPx = useCanvasViewportStore((s) => s.stageHeightPx);
  const panX = useCanvasViewportStore((s) => s.panX);
  const panY = useCanvasViewportStore((s) => s.panY);
  return useMemo(
    () =>
      computeFrameLayout({
        frameWidthPx,
        zoomMode,
        manualZoom,
        stageWidthPx,
        stageHeightPx,
        panX,
        panY,
      }),
    [frameWidthPx, zoomMode, manualZoom, stageWidthPx, stageHeightPx, panX, panY],
  );
}

/** Reported once the iframe document has loaded and `#wb-site-root` exists. */
export interface SiteFrameHandle {
  readonly iframe: HTMLIFrameElement;
  readonly siteRoot: HTMLElement;
}

export interface SiteFrameProps {
  readonly iframeRef: RefObject<HTMLIFrameElement | null>;
  /** Resolved page elements; the Tailwind and element CSS are compiled from them. */
  readonly elements: readonly EditorElement[];
  /** The project's custom CSS (`project.header.cssStyles`). */
  readonly projectCss?: string | null;
  /** Controller handlers; React portal events from the site bubble to them. */
  readonly siteHandlers?: CanvasSiteHandlers;
  readonly onReady: (handle: SiteFrameHandle | null) => void;
  /** Rendered into `#wb-site-root` through a portal. */
  readonly children?: ReactNode;
}

function writeStyle(doc: Document, id: string, css: string): void {
  let style = doc.getElementById(id);
  if (!style) {
    style = doc.createElement("style");
    style.id = id;
    doc.head.appendChild(style);
  }
  if (style.textContent !== css) style.textContent = css;
}

/**
 * One persistent, site-only iframe. Width, zoom and pan are CSS on the frame
 * wrapper, so changing the viewport never reloads or remounts the document.
 */
export function SiteFrame({
  iframeRef,
  elements,
  projectCss,
  siteHandlers,
  onReady,
  children,
}: SiteFrameProps): ReactElement {
  const collab = useCollaborationOptional();
  const setCanvasElement = collab?.setCanvasElement;
  const layout = useFrameLayout();
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const attach = (): void => {
      setMountNode(iframe.contentDocument?.getElementById(SITE_ROOT_ID) ?? null);
    };
    iframe.addEventListener("load", attach);
    attach();
    return () => {
      iframe.removeEventListener("load", attach);
      setMountNode(null);
    };
  }, [iframeRef]);

  useEffect(() => {
    const iframe = iframeRef.current;
    onReady(iframe && mountNode ? { iframe, siteRoot: mountNode } : null);
    return () => onReady(null);
  }, [iframeRef, mountNode, onReady]);

  useEffect(() => {
    if (!mountNode) return;
    setCanvasElement?.(mountNode);
    return () => setCanvasElement?.(null);
  }, [setCanvasElement, mountNode]);

  const tailwindCss = useProjectTailwindCss(elements);
  const elementCss = useMemo(() => compileElementStylesCss(elements), [elements]);
  const projectStyleCss = useMemo(
    () => [sanitizeProjectCss(projectCss), CANVAS_INTERACTION_CSS].filter(Boolean).join("\n"),
    [projectCss],
  );

  useLayoutEffect(() => {
    if (!mountNode) return;
    const doc = mountNode.ownerDocument;
    writeStyle(doc, TAILWIND_STYLE_ID, tailwindCss);
    writeStyle(doc, ELEMENT_STYLES_STYLE_ID, elementCss);
    writeStyle(doc, PROJECT_STYLE_ID, projectStyleCss);
  }, [mountNode, tailwindCss, elementCss, projectStyleCss]);

  const frameStyle: React.CSSProperties = {
    left: layout.left,
    top: layout.top,
    width: layout.width,
    height: layout.height,
    transform: `scale(${layout.zoom})`,
    transformOrigin: "0 0",
  };

  return (
    <div
      data-site-frame
      className="absolute bg-white shadow-2xl ring-1 ring-border/80"
      style={frameStyle}
      {...siteHandlers}
    >
      <iframe
        ref={iframeRef}
        id="preview-iframe"
        title="Site preview"
        aria-label="editor-preview-iframe"
        srcDoc={SITE_IFRAME_SRCDOC}
        className="block h-full w-full border-0"
      />
      {mountNode ? createPortal(children, mountNode) : null}
    </div>
  );
}
