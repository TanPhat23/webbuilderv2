
import React, { useEffect, useRef, useState } from "react";
import { EditorComponentProps } from "@/features/editor";
import { MediaDropOverlay } from "./shared/MediaDropOverlay";
import ImageView from "@webbuilder/site-runtime/elements/views/ImageView";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
  EmptyDescription,
} from "@/components/ui/empty";
import { ImageIcon } from "lucide-react";
import { cn } from "@webbuilder/site-runtime/lib/utils";
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

const ImageComponent: React.FC<EditorComponentProps> = ({ element, data }) => {
  const { rootProps } = useCanvasElement(element);
  const { ref: placeholderRef, hasRoom } = useRoomForDetails(!element.src);
  const { isDragOver, dragTarget, handleDragOver, handleDragLeave, handleDrop } =
    useMediaDrop({
      element,
      mediaType: "image",
    });

  const dragHandlers = {
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };

  const wrapperProps = { ...rootProps, ...dragHandlers };

  if (element.type !== "Image") return null;
  if (element.src) {
    return (
      <>
        <ImageView element={element} data={data} mode="edit" rootProps={{
          ...wrapperProps,
          className: cn(rootProps.className, isDragOver && "ring-2 ring-primary ring-offset-2"),
        }} />
        {dragTarget && <MediaDropOverlay target={dragTarget} label="Drop to replace image" />}
      </>
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
