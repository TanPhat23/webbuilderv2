import React, {
  useEffect,
  useRef,
  useMemo,
  useState,
  useCallback,
} from "react";
import { MousePointer } from "lucide-react";
import { EditorElement } from "@/types/global.type";
import ElementLoader from "@/components/editor/ElementLoader";
import { Button } from "@/components/ui/button";
import { KeyboardEvent as KeyboardEventClass } from "@/lib/utils/element/keyBoardEvents";
import { useMouseTracking } from "@/hooks/realtime/use-mouse-tracking";
import { useMouseStore } from "@/globalstore/mouse-store";
import { useCollaborationOptional } from "@/providers/collaborationprovider";

type EditorCanvasProps = {
  isDraggingOver: boolean;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  isLoading: boolean;
  selectedElement: EditorElement | null;
  addNewSection: () => void;
  userId: string;
  sendMessage?: (message: any) => boolean;
  isReadOnly?: boolean;
  isLocked?: boolean;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
};

const EditorCanvas: React.FC<EditorCanvasProps> = ({
  isDraggingOver,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  isLoading,
  selectedElement,
  addNewSection,
  userId,
  sendMessage,
  isReadOnly = false,
  isLocked = false,
  iframeRef,
}) => {
  const collab = useCollaborationOptional();
  const ydoc = collab?.ydoc ?? null;
  const provider = collab?.provider ?? null;

  const canvasRef = useRef<HTMLDivElement>(null);
  const innerContentRef = useRef<HTMLDivElement>(null);
  const keyboardEvent = new KeyboardEventClass();
  const { mousePositions, remoteUsers, users } = useMouseStore();
  const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    keyboardEvent.setReadOnly(isReadOnly);
    keyboardEvent.setLocked(isLocked);
  }, [isReadOnly, isLocked, keyboardEvent]);

  useEffect(() => {
    if (!innerContentRef.current) return;

    const handleScroll = () => {
      setScrollOffset({
        x: innerContentRef.current?.scrollLeft || 0,
        y: innerContentRef.current?.scrollTop || 0,
      });
    };

    const container = innerContentRef.current;
    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useMouseTracking({
    canvasRef,
    sendMessage: sendMessage || (() => false),
    userId,
    enabled: !ydoc,
  });

  useEffect(() => {
    if (!provider || !provider.awareness) return;

    let logCount = 0;
    let lastX = -1;
    let lastY = -1;
    let lastUpdateTime = 0;
    const THROTTLE_MS = 50;

    const isIframe = iframeRef && iframeRef.current;
    const targetDoc = isIframe ? iframeRef.current?.contentDocument : document;

    if (!targetDoc) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdateTime < THROTTLE_MS) {
        return;
      }
      lastUpdateTime = now;

      let x: number;
      let y: number;

      if (isIframe) {
        x = e.clientX;
        y = e.clientY;
        logCount++;
      } else {
        if (!canvasRef.current) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        if (!canvasRect) return;

        logCount++;

        const isInsideCanvas =
          e.clientX >= canvasRect.left &&
          e.clientX <= canvasRect.right &&
          e.clientY >= canvasRect.top &&
          e.clientY <= canvasRect.bottom;

        if (!isInsideCanvas) {
          return;
        }

        x = e.clientX - canvasRect.left;
        y = e.clientY - canvasRect.top;
      }

      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      if (lastX !== -1 && deltaX < 3 && deltaY < 3) {
        return;
      }
      lastX = x;
      lastY = y;

      try {
        provider.awareness.setLocalStateField("cursor", { x, y });
      } catch (err) {
        // Silent error handling
      }
    };

    const handleMouseLeave = () => {
      try {
        provider.awareness.setLocalStateField("cursor", null);
      } catch (err) {
        // Silent error handling
      }
    };

    const trackingTarget = isIframe ? iframeRef.current : canvasRef.current;
    if (!trackingTarget) return;

    targetDoc.addEventListener("mousemove", handleMouseMove, { passive: true });
    if (!isIframe) {
      trackingTarget.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      targetDoc.removeEventListener("mousemove", handleMouseMove);
      if (!isIframe) {
        trackingTarget.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [provider, iframeRef]);

  const remoteCursors = useMemo(() => {
    if (ydoc && remoteUsers) {
      const cursors = Object.entries(remoteUsers)
        .filter(([uid]) => uid !== userId)
        .map(([uid, pos]) => {
          const x = typeof pos.x === "number" ? pos.x : 0;
          const y = typeof pos.y === "number" ? pos.y : 0;

          return {
            uid,
            x: x - scrollOffset.x,
            y: y - scrollOffset.y,
            userName: users[uid]?.userName || `User ${uid.slice(0, 8)}`,
          };
        });

      return cursors;
    }
    return [];
  }, [ydoc, remoteUsers, userId, users, scrollOffset]);

  const webSocketCursors = useMemo(() => {
    if (!ydoc && mousePositions) {
      return Object.entries(mousePositions)
        .filter(([uid]) => uid !== userId)
        .map(([uid, pos]) => ({
          uid,
          x: typeof pos.x === "number" ? pos.x - scrollOffset.x : 0,
          y: typeof pos.y === "number" ? pos.y - scrollOffset.y : 0,
          userName: users[uid]?.userName || `User ${uid.slice(0, 8)}`,
        }));
    }
    return [];
  }, [ydoc, mousePositions, userId, users, scrollOffset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "c":
            e.preventDefault();
            keyboardEvent.copyElement();
            break;
          case "v":
            e.preventDefault();
            keyboardEvent.pasteElement();
            break;
          case "x":
            e.preventDefault();
            keyboardEvent.cutElement();
            break;
          case "z":
            e.preventDefault();
            keyboardEvent.undo();
            break;
          case "y":
            e.preventDefault();
            keyboardEvent.redo();
            break;
        }
      } else if (e.key === "Delete") {
        e.preventDefault();
        keyboardEvent.deleteElement();
      } else if (e.key === "Escape") {
        e.preventDefault();
        keyboardEvent.deselectAll();
      }
    };

    canvas.addEventListener("keydown", handleKeyDown);

    let iframeDoc: Document | null = null;
    if (iframeRef?.current?.contentDocument) {
      iframeDoc = iframeRef.current.contentDocument;
      iframeDoc.addEventListener("keydown", handleKeyDown, true);
    }

    return () => {
      canvas.removeEventListener("keydown", handleKeyDown);
      if (iframeDoc) {
        iframeDoc.removeEventListener("keydown", handleKeyDown, true);
      }
    };
  }, [keyboardEvent, iframeRef]);

  return (
    <div
      ref={canvasRef}
      className={`h-full relative flex flex-col bg-background ${
        isDraggingOver ? "bg-primary/10" : ""
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      id="canvas"
      tabIndex={0}
    >
      {(ydoc ? remoteCursors : webSocketCursors).map(
        ({ uid, x, y, userName }) => (
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
        ),
      )}
      <div
        ref={innerContentRef}
        className="overflow-x-hidden h-full w-full p-4"
      >
        {isLoading ? null : (
          <ElementLoader
            isReadOnly={isReadOnly}
            isLocked={isLocked}
            iframeRef={iframeRef}
          />
        )}
        {!selectedElement && (
          <Button
            className="mb-4 w-full"
            onClick={addNewSection}
            disabled={isReadOnly || isLocked}
          >
            + Add new section
          </Button>
        )}
      </div>
    </div>
  );
};

export default EditorCanvas;
