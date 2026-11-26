import MediaView from "@webbuilder/site-runtime/elements/views/MediaView";
import { MediaDropOverlay } from "./shared/MediaDropOverlay";

import React from "react";
import { EditorComponentProps } from "@/features/editor";
import { VideoElement } from "@/features/editor";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
  EmptyDescription,
} from "@/components/ui/empty";
import { Video } from "lucide-react";
import { cn } from "@webbuilder/site-runtime/lib/utils";
import {
  useCanvasElement,
  useMediaDrop,
  DropOverlay,
} from "./shared";

const VideoComponent = ({ element }: EditorComponentProps) => {
  const videoElement = element as VideoElement;
  const { rootProps } = useCanvasElement(videoElement);
  const { isDragOver, dragTarget, handleDragOver, handleDragLeave, handleDrop } =
    useMediaDrop({
      element,
      mediaType: "video",
    });

  const dragHandlers = {
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };

  const wrapperProps = { ...rootProps, ...dragHandlers };

  if (videoElement.src) {
    return (
      <>
        <MediaView element={videoElement} mode="edit" rootProps={{
          ...wrapperProps,
          className: cn(rootProps.className, isDragOver && "ring-2 ring-primary ring-offset-2"),
        }} />
        {dragTarget && <MediaDropOverlay target={dragTarget} label="Drop to replace video" />}
      </>
    );
  }

  return (
    <div
      {...wrapperProps}
      className={cn(
        rootProps.className,
        isDragOver && "ring-2 ring-primary ring-offset-2",
      )}
    >
      <Empty className="w-full h-full min-w-56 md:p-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Video />
          </EmptyMedia>
          <EmptyTitle>No video selected</EmptyTitle>
          <EmptyDescription className="text-xs">
            Add a video source URL or drag a video here
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
      {isDragOver && <DropOverlay label="Drop to add video" />}
    </div>
  );
};

export default VideoComponent;
