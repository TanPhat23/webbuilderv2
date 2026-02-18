"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useElementHandler } from "@/hooks";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { VideoElement, VideoSettings } from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
  EmptyDescription,
} from "@/components/ui/empty";
import { Video, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const VideoComponent = ({ element }: EditorComponentProps) => {
  const videoElement = element as VideoElement;
  const [isDragOver, setIsDragOver] = useState(false);
  const updateElement = useUpdateElement();
  const { id } = useParams();

  const { getCommonProps } = useElementHandler();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: id as string,
    });

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const data = e.dataTransfer.getData("application/json");
      if (!data) {
        toast.error("Invalid drag data");
        return;
      }

      const parsedData = JSON.parse(data);

      if (parsedData.type === "video" && parsedData.videoLink) {
        updateElement(element.id, {
          ...element,
          src: parsedData.videoLink,
          name: parsedData.videoName || "Video",
        });

        toast.success("Video updated successfully!");
      }
    } catch (error) {
      console.error("Drop error:", error);
      toast.error("Failed to update video");
    }
  };

  useEffect(() => {
    if (element.events) {
      registerEvents(element.events);
    }
  }, [element.events, registerEvents]);

  const eventHandlers = createEventHandlers();

  if (videoElement.src) {
    return (
      <div
        ref={elementRef as React.RefObject<HTMLDivElement>}
        data-element-id={element.id}
        data-element-type={element.type}
        className={cn(
          "relative w-full h-full",
          isDragOver && "ring-2 ring-primary ring-offset-2",
        )}
        {...eventHandlers}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          ...safeStyles,
          width: "100%",
          height: "100%",
          cursor: eventsActive ? "pointer" : "inherit",
          userSelect: eventsActive ? "none" : "auto",
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
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
            <div className="bg-background/90 p-4 rounded-lg shadow-lg">
              <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Drop to replace video</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      className={cn(
        "w-full h-full",
        isDragOver && "ring-2 ring-primary ring-offset-2",
      )}
      {...eventHandlers}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        cursor: eventsActive ? "pointer" : "inherit",
        userSelect: eventsActive ? "none" : "auto",
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
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
          <div className="bg-background/90 p-4 rounded-lg shadow-lg">
            <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Drop to add video</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoComponent;
