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
  showAddSectionButton?: boolean;
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
  showAddSectionButton = true,
  iframeRef,
}) => {
  const collab = useCollaborationOptional();

  const canvasRef = useRef<HTMLDivElement>(null);
  const innerContentRef = useRef<HTMLDivElement>(null);
  const keyboardEvent = new KeyboardEventClass();
  const { remoteUsers, users } = useMouseStore();
  const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });

  // Assign the canvas ref to the collaboration provider for mouse tracking
  useEffect(() => {
    if (collab && canvasRef.current) {
      (collab.canvasRef as React.RefObject<HTMLElement | null>).current =
        canvasRef.current;
    }
  }, [collab, canvasRef.current]);

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

  // Build the list of remote cursors from the mouse store
  const remoteCursors = useMemo(() => {
    if (!remoteUsers) return [];

    return Object.entries(remoteUsers)
      .filter(([uid]) => uid !== userId)
      .filter(([_, pos]) => {
        // Filter out "hidden" cursors (sent as -1, -1 on mouse leave)
        const x = typeof pos.x === "number" ? pos.x : 0;
        const y = typeof pos.y === "number" ? pos.y : 0;
        return x >= 0 && y >= 0;
      })
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
  }, [remoteUsers, userId, users, scrollOffset]);

  // Keyboard shortcuts
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
        {!selectedElement && showAddSectionButton && (
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
