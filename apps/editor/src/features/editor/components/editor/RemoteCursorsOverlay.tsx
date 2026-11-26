import React, { memo, useLayoutEffect, useMemo, useState } from "react";
import { MousePointer } from "lucide-react";
import { useCollaborationCursors } from "@/features/editor";
import {
  computeEffectiveZoom,
  useCanvasViewportStore,
} from "@/features/editor/store/canvas-viewport-store";
import {
  iframeDocPointToStage,
  type StageProjectionParams,
} from "@/features/editor/components/canvas/rectTracker";

export interface RemoteCursorsOverlayProps {
  userId: string;
  /** `#wb-site-root` inside the preview iframe. */
  siteRoot: HTMLElement | null;
  stageEl: HTMLElement | null;
  iframeEl: HTMLIFrameElement | null;
}

interface DocScroll {
  readonly scrollLeft: number;
  readonly scrollTop: number;
}

interface ProjectionState {
  readonly scroll: DocScroll;
  readonly params: StageProjectionParams;
}

/** Maps a collaborator's document-space cursor into this user's stage space. */
export function projectRemoteCursorToStage(
  point: { readonly x: number; readonly y: number },
  scroll: DocScroll,
  params: StageProjectionParams,
): { readonly x: number; readonly y: number } {
  return iframeDocPointToStage(point.x, point.y, scroll, params);
}

function sameRect(
  a: StageProjectionParams["stageRect"],
  b: StageProjectionParams["stageRect"],
): boolean {
  return (
    a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height
  );
}

function sameProjection(a: ProjectionState | null, b: ProjectionState | null): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  return (
    a.scroll.scrollLeft === b.scroll.scrollLeft &&
    a.scroll.scrollTop === b.scroll.scrollTop &&
    a.params.zoom === b.params.zoom &&
    sameRect(a.params.stageRect, b.params.stageRect) &&
    sameRect(a.params.frameRect, b.params.frameRect)
  );
}

/** Live scroll offset and stage/frame geometry, coalesced onto animation frames. */
function useStageProjection(
  siteRoot: HTMLElement | null,
  stageEl: HTMLElement | null,
  iframeEl: HTMLIFrameElement | null,
): ProjectionState | null {
  const [state, setState] = useState<ProjectionState | null>(null);

  useLayoutEffect(() => {
    if (!siteRoot || !stageEl || !iframeEl) return;
    const doc = siteRoot.ownerDocument;
    let rafId: number | null = null;
    let disposed = false;

    const measure = (): void => {
      rafId = null;
      if (disposed) return;
      const scroller = doc.scrollingElement ?? doc.documentElement;
      const next: ProjectionState = {
        scroll: { scrollLeft: scroller.scrollLeft, scrollTop: scroller.scrollTop },
        params: {
          stageRect: stageEl.getBoundingClientRect(),
          frameRect: iframeEl.getBoundingClientRect(),
          zoom: computeEffectiveZoom(useCanvasViewportStore.getState()),
        },
      };
      setState((prev) => (sameProjection(prev, next) ? prev : next));
    };
    const schedule = (): void => {
      if (rafId === null) rafId = requestAnimationFrame(measure);
    };

    measure();
    doc.addEventListener("scroll", schedule, { capture: true, passive: true });
    const unsubscribe = useCanvasViewportStore.subscribe(schedule);
    return () => {
      disposed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      doc.removeEventListener("scroll", schedule, true);
      unsubscribe();
    };
  }, [siteRoot, stageEl, iframeEl]);

  return siteRoot && stageEl && iframeEl ? state : null;
}

export const RemoteCursorsOverlay: React.FC<RemoteCursorsOverlayProps> = ({
  userId,
  siteRoot,
  stageEl,
  iframeEl,
}) => {
  const { remoteUsers, users } = useCollaborationCursors();
  const projection = useStageProjection(siteRoot, stageEl, iframeEl);

  const remoteCursors = useMemo(() => {
    if (!remoteUsers || !projection) return [];

    return Object.entries(remoteUsers)
      .filter(([uid]) => uid !== userId)
      .filter(([, pos]) => {
        // Filter out "hidden" cursors (sent as -1, -1 on mouse leave)
        const x = typeof pos.x === "number" ? pos.x : 0;
        const y = typeof pos.y === "number" ? pos.y : 0;
        return x >= 0 && y >= 0;
      })
      .map(([uid, pos]) => {
        const docPoint = {
          x: typeof pos.x === "number" ? pos.x : 0,
          y: typeof pos.y === "number" ? pos.y : 0,
        };
        const { x, y } = projectRemoteCursorToStage(
          docPoint,
          projection.scroll,
          projection.params,
        );
        return {
          uid,
          x,
          y,
          userName: users[uid]?.userName || `User ${uid.slice(0, 8)}`,
        };
      });
  }, [remoteUsers, userId, users, projection]);

  if (remoteCursors.length === 0) {
    return null;
  }

  return (
    <>
      {remoteCursors.map(({ uid, x, y, userName }) => (
        <div
          key={`cursor-${uid}`}
          className="absolute pointer-events-none z-9999 flex flex-col items-start gap-1 transition-all duration-75"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            transform: "translate(-2px, -2px)",
          }}
        >
          <MousePointer className="w-5 h-5 text-blue-500 drop-shadow-lg" />
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
            {userName}
          </div>
        </div>
      ))}
    </>
  );
};

export default memo(RemoteCursorsOverlay);
