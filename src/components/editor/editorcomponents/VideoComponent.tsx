"use client";

import React from "react";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { VideoElement, VideoSettings } from "@/interfaces/elements.interface";
import { useElementHandler } from "@/hooks";
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
  useEditorElement,
  eventsStyle,
  useMediaDrop,
  DropOverlay,
} from "./shared";

const VideoComponent = ({ element }: EditorComponentProps) => {
  const videoElement = element as VideoElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });
  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } =
    useMediaDrop({
      element,
      mediaType: "video",
    });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(videoElement);

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

  const wrapperProps = {
    ref: elementRef as React.RefObject<HTMLDivElement>,
    "data-element-id": element.id,
    "data-element-type": element.type,
    ...getCommonProps(videoElement),
    ...eventHandlers,
    ...dragHandlers,
  };

  if (videoElement.src) {
    return (
      <div
        {...wrapperProps}
        className={cn(
          "relative w-full h-full",
          isDragOver && "ring-2 ring-primary ring-offset-2",
        )}
        style={{
          ...safeStyles,
          width: "100%",
          height: "100%",
          ...eventsStyle(eventsActive),
        }}
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
        "w-full h-full",
        isDragOver && "ring-2 ring-primary ring-offset-2",
      )}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive),
      }}
    >
      <Empty className="w-full h-full">
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
