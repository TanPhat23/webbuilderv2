
import React, { useEffect, useRef, useState } from "react";
import { EditorComponentProps } from "@/features/editor";
import { ImageSettings } from "@/features/editor";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
  EmptyDescription,
} from "@/components/ui/empty";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCanvasElement,
  useMediaDrop,
  DropOverlay,
} from "./shared";

/** Below this width the empty placeholder collapses to just its icon. */
const DETAILED_PLACEHOLDER_MIN_WIDTH = 160;

/**
 * Tracks whether the empty-image placeholder has room for its full message.
 * Starts compact so small slots (e.g. a navbar logo) never overflow onto
 * neighbouring elements, and expands only once the box is measured wide enough.
 */
function useRoomForDetails(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasRoom, setHasRoom] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node) return;
    const update = () =>
      setHasRoom(node.getBoundingClientRect().width >= DETAILED_PLACEHOLDER_MIN_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return { ref, hasRoom };
}

const ImageComponent: React.FC<EditorComponentProps> = ({ element }) => {
  const { rootProps } = useCanvasElement(element);
  const { ref: placeholderRef, hasRoom } = useRoomForDetails(!element.src);
  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } =
    useMediaDrop({
      element,
      mediaType: "image",
    });

  const imageSettings = (
    element.type === "Image" ? element.settings : null
  ) as ImageSettings | null;
  const objectFit = imageSettings?.objectFit ?? "cover";
  const loading = imageSettings?.loading ?? "lazy";
  const decoding = imageSettings?.decoding ?? "async";

  const dragHandlers = {
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };

  const wrapperProps = { ...rootProps, ...dragHandlers };

  if (element.src) {
    return (
      <div
        {...wrapperProps}
        className={cn(
          rootProps.className,
          "relative",
          isDragOver && "ring-2 ring-primary ring-offset-2",
        )}
      >
        <img
          src={element.src}
          alt={element.name || "Image"}
          style={{ objectFit: objectFit as React.CSSProperties["objectFit"] }}
          loading={loading}
          decoding={decoding}
          role="img"
          className="w-full h-full"
        />
        {isDragOver && <DropOverlay label="Drop to replace image" />}
      </div>
    );
  }

  return (
    <div
      {...wrapperProps}
      ref={placeholderRef}
      className={cn(
        rootProps.className,
        "overflow-hidden",
        isDragOver && "ring-2 ring-primary ring-offset-2",
      )}
    >
      {hasRoom ? (
        <Empty className="w-full h-full min-w-56 md:p-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon />
            </EmptyMedia>
            <EmptyTitle>No image selected</EmptyTitle>
            <EmptyDescription className="text-xs">
              Drag an image from the sidebar to add it here
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Empty className="w-full h-full min-w-0 gap-0 p-1 md:p-1">
          <EmptyMedia variant="icon" className="mb-0 size-7">
            <ImageIcon className="size-4" aria-label="No image selected" />
          </EmptyMedia>
        </Empty>
      )}
      {isDragOver && <DropOverlay label="Drop to add image" />}
    </div>
  );
};

export default ImageComponent;
