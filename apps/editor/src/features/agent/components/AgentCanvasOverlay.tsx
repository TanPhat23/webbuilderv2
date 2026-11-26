import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { MousePointer2, Sparkles } from "lucide-react";
import { useCollaborationOptional } from "@/features/collaboration/context/CollaborationContext";
import type { RemoteAgentPresence } from "@/features/collaboration/interfaces/websocket";
import {
  findElementNode,
  type ElementRect,
} from "@/features/editor/components/canvas/rectTracker";
import { useCanvasViewportStore } from "@/features/editor/store/canvas-viewport-store";
import { useElementStore } from "@/features/editor/store/element-store";
import { useAgentPlaybackStore } from "../playbackStore";

/** Maps a node in the site root to HUD (stage) pixels. */
type ProjectRect = (node: HTMLElement) => ElementRect | null;

interface AgentCanvasOverlayProps {
  /** `#wb-site-root` inside the preview iframe. */
  readonly root: HTMLElement;
  /** When given, rects are drawn in stage pixels instead of root-relative ones. */
  readonly projectRect?: ProjectRect;
}

interface AgentCursorDescriptor {
  readonly key: string;
  readonly name: string;
  readonly status: string;
  readonly targetElementId: string | null;
  readonly isLocal: boolean;
}

interface CursorPoint {
  readonly x: number;
  readonly y: number;
}

interface MeasuredAgentState {
  readonly rect: ElementRect | null;
  readonly point: CursorPoint;
}

function measureRelativeRect(
  root: HTMLElement,
  node: HTMLElement,
  projectRect: ProjectRect | undefined,
): ElementRect {
  const projected = projectRect?.(node);
  if (projected) return projected;
  const nodeRect = node.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  return {
    left: nodeRect.left - rootRect.left,
    top: nodeRect.top - rootRect.top,
    width: nodeRect.width,
    height: nodeRect.height,
  };
}

function isOutsideViewport(node: HTMLElement): boolean {
  const view = node.ownerDocument.defaultView;
  if (!view) return false;
  const rect = node.getBoundingClientRect();
  const margin = 48;
  return rect.top < margin || rect.bottom > view.innerHeight - margin;
}

function defaultStartPoint(
  root: HTMLElement,
  projectRect: ProjectRect | undefined,
): CursorPoint {
  const rootRect = projectRect?.(root);
  if (rootRect) {
    return {
      x: rootRect.left + Math.max(24, Math.round(rootRect.width * 0.5)),
      y: rootRect.top + 48,
    };
  }
  return {
    x: Math.max(24, Math.round(root.clientWidth * 0.5)),
    y: 48,
  };
}

function pointForRect(rect: ElementRect): CursorPoint {
  return {
    x: Math.round(rect.left + Math.min(28, rect.width * 0.25)),
    y: Math.round(rect.top + Math.min(20, rect.height * 0.25)),
  };
}

const EMPTY_REMOTE_AGENTS: readonly RemoteAgentPresence[] = [];

export function AgentCanvasOverlay({
  root,
  projectRect,
}: AgentCanvasOverlayProps): ReactElement | null {
  const playback = useAgentPlaybackStore((s) => s.playback);
  const pruneTouched = useAgentPlaybackStore((s) => s.pruneTouched);
  const collab = useCollaborationOptional();
  const elements = useElementStore((s) => s.elements);
  // Camera moves (zoom, pan, width, stage size) and iframe scrolls shift every
  // projected rect, so they re-measure just like element edits do.
  const cameraKey = useCanvasViewportStore(
    (s) =>
      `${s.frameWidthPx}:${s.zoomMode}:${s.manualZoom}:${s.stageWidthPx}:${s.stageHeightPx}:${s.panX}:${s.panY}`,
  );
  const [scrollTick, setScrollTick] = useState(0);

  const remoteAgents = collab?.remoteAgents ?? EMPTY_REMOTE_AGENTS;
  const lastPointsRef = useRef<Map<string, CursorPoint>>(new Map());
  const userScrolledRef = useRef(false);

  const [measured, setMeasured] = useState<Readonly<Record<string, MeasuredAgentState>>>({});
  const [touchedRects, setTouchedRects] = useState<Readonly<Record<string, ElementRect>>>({});

  const activeCursors = useMemo<readonly AgentCursorDescriptor[]>(() => {
    const list: AgentCursorDescriptor[] = [];
    if (playback.status === "playing") {
      list.push({
        key: "local-agent",
        name: playback.agentName,
        status: playback.statusLabel,
        targetElementId: playback.targetElementId,
        isLocal: true,
      });
    }
    for (const remote of remoteAgents) {
      if (!remote.agent.active) continue;
      list.push({
        key: `remote-agent-${remote.userId}`,
        name: `${remote.userName}'s ${remote.agent.name || "Agent"}`,
        status: remote.agent.status,
        targetElementId: remote.agent.elementId ?? null,
        isLocal: false,
      });
    }
    return list;
  }, [playback, remoteAgents]);

  const touchedIds = useMemo(
    () => Object.keys(playback.recentlyTouched),
    [playback.recentlyTouched],
  );

  // Reset user scroll override when local playback starts or ends.
  useEffect(() => {
    if (playback.status !== "playing") {
      userScrolledRef.current = false;
      return;
    }

    const doc = root.ownerDocument;
    const markUserScrolled = (): void => {
      userScrolledRef.current = true;
    };
    doc.addEventListener("wheel", markUserScrolled, { passive: true });
    doc.addEventListener("touchstart", markUserScrolled, { passive: true });
    return () => {
      doc.removeEventListener("wheel", markUserScrolled);
      doc.removeEventListener("touchstart", markUserScrolled);
    };
  }, [playback.status, root]);

  // Re-measure when the iframe document scrolls (rects are viewport-relative).
  useEffect(() => {
    if (!projectRect) return;
    const doc = root.ownerDocument;
    const onScroll = (): void => setScrollTick((tick) => tick + 1);
    doc.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => doc.removeEventListener("scroll", onScroll, true);
  }, [root, projectRect]);

  // Periodically prune recentlyTouched glow badges so they fade cleanly.
  useEffect(() => {
    if (touchedIds.length === 0) return;
    const timer = window.setInterval(() => {
      pruneTouched(900);
    }, 200);
    return () => {
      window.clearInterval(timer);
    };
  }, [pruneTouched, touchedIds.length]);

  useLayoutEffect(() => {
    if (activeCursors.length === 0 && touchedIds.length === 0) {
      lastPointsRef.current.clear();
      return;
    }

    const measureAll = (): void => {
      const nextMeasured: Record<string, MeasuredAgentState> = {};
      const activeKeys = new Set<string>();

      for (const cursor of activeCursors) {
        activeKeys.add(cursor.key);
        const node = cursor.targetElementId
          ? findElementNode(root, cursor.targetElementId)
          : null;
        if (node) {
          const rect = measureRelativeRect(root, node, projectRect);
          const point = pointForRect(rect);
          lastPointsRef.current.set(cursor.key, point);
          nextMeasured[cursor.key] = { rect, point };

          if (cursor.isLocal && !userScrolledRef.current && isOutsideViewport(node)) {
            node.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        } else {
          const fallback =
            lastPointsRef.current.get(cursor.key) ??
            defaultStartPoint(root, projectRect);
          lastPointsRef.current.set(cursor.key, fallback);
          nextMeasured[cursor.key] = { rect: null, point: fallback };
        }
      }

      for (const existingKey of Array.from(lastPointsRef.current.keys())) {
        if (!activeKeys.has(existingKey)) {
          lastPointsRef.current.delete(existingKey);
        }
      }

      const nextTouched: Record<string, ElementRect> = {};
      for (const id of touchedIds) {
        const node = findElementNode(root, id);
        if (node) {
          nextTouched[id] = measureRelativeRect(root, node, projectRect);
        }
      }

      setMeasured(nextMeasured);
      setTouchedRects(nextTouched);
    };

    const rafId = window.requestAnimationFrame(measureAll);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [activeCursors, elements, root, touchedIds, projectRect, cameraKey, scrollTick]);

  if (activeCursors.length === 0 && touchedIds.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {touchedIds.map((id) => {
        const rect = touchedRects[id];
        if (!rect) return null;
        return (
          <div
            key={`touched-${id}`}
            className="border-primary/45 bg-primary/5 absolute rounded-md border transition-opacity duration-300"
            style={{
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
            }}
          />
        );
      })}

      {activeCursors.map((cursor) => {
        const state = measured[cursor.key];
        const point = state?.point ?? defaultStartPoint(root, projectRect);
        const rect = state?.rect ?? null;

        return (
          <div key={cursor.key}>
            {rect && (
              <div
                className="border-primary bg-primary/10 absolute rounded-md border-2 transition-all duration-200"
                style={{
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                }}
              />
            )}

            <div
              className="absolute top-0 left-0 z-10 flex items-start gap-1 will-change-transform"
              style={{
                transform: `translate3d(${point.x}px, ${point.y}px, 0)`,
                transition: "transform 360ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <MousePointer2 className="text-primary fill-primary size-4 shrink-0 drop-shadow-sm" />
              <div className="bg-primary text-primary-foreground flex max-w-[240px] items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap shadow-lg">
                <Sparkles className="size-3 shrink-0" />
                <span className="font-semibold">{cursor.name}</span>
                {cursor.status && (
                  <span className="truncate opacity-90">· {cursor.status}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
