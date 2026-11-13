
import React from "react";
import { EditorComponentProps } from "@/features/editor";
import { VideoElement, VideoSettings } from "@/features/editor";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
  EmptyDescription,
} from "@/components/ui/empty";
import { Video } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCanvasElement,
  useMediaDrop,
  DropOverlay,
} from "./shared";

const VideoComponent = ({ element }: EditorComponentProps) => {
  const videoElement = element as VideoElement;
  const { rootProps } = useCanvasElement(videoElement);
  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } =
    useMediaDrop({
      element,
      mediaType: "video",
    });

  const settings = (videoElement.settings ?? {}) as VideoSettings;
  const controls = settings.controls ?? true;
  const autoplay = settings.autoplay ?? false;
  const loop = settings.loop ?? false;
  const muted = settings.muted ?? false;
  const poster = settings.poster;
  const preload = settings.preload ?? "metadata";
  const playsInline = settings.playsInline ?? true;
  const objectFit = settings.objectFit ?? "contain";

  const dragHandlers = {
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };

  const wrapperProps = { ...rootProps, ...dragHandlers };

  if (videoElement.src) {
    return (
      <div
        {...wrapperProps}
        className={cn(
          rootProps.className,
          "relative",
          isDragOver && "ring-2 ring-primary ring-offset-2",
        )}
      >
        <video
          src={videoElement.src}
          controls={controls}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          poster={poster}
          preload={preload}
          playsInline={playsInline}
          style={{
            width: "100%",
            height: "100%",
            objectFit: objectFit as React.CSSProperties["objectFit"],
          }}
        />
        {isDragOver && <DropOverlay label="Drop to replace video" />}
      </div>
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
