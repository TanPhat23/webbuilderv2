"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useElementHandler } from "@/hooks";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { AudioElement, AudioSettings } from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
  EmptyDescription,
} from "@/components/ui/empty";
import { Volume2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const AudioComponent = ({ element }: EditorComponentProps) => {
  const audioElement = element as AudioElement;
  const [isDragOver, setIsDragOver] = useState(false);
  const updateElement = useUpdateElement();
  const { id } = useParams();

  const { getCommonProps } = useElementHandler();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: id as string,
    });

  const safeStyles = elementHelper.getSafeStyles(audioElement);

  const settings = (audioElement.settings ?? {}) as AudioSettings;
  const controls = settings.controls ?? true;
  const autoplay = settings.autoplay ?? false;
  const loop = settings.loop ?? false;
  const muted = settings.muted ?? false;
  const preload = settings.preload ?? "metadata";

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

      if (parsedData.type === "audio" && parsedData.audioLink) {
        updateElement(element.id, {
          ...element,
          src: parsedData.audioLink,
          name: parsedData.audioName || "Audio",
        });

        toast.success("Audio updated successfully!");
      }
    } catch (error) {
      console.error("Drop error:", error);
      toast.error("Failed to update audio");
    }
  };

  useEffect(() => {
    if (element.events) {
      registerEvents(element.events);
    }
  }, [element.events, registerEvents]);

  const eventHandlers = createEventHandlers();

  if (audioElement.src) {
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
        <audio
          src={audioElement.src}
          controls={controls}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          preload={preload}
          style={{
            width: "100%",
          }}
        />
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
            <div className="bg-background/90 p-4 rounded-lg shadow-lg">
              <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Drop to replace audio</p>
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
            <Volume2 />
          </EmptyMedia>
          <EmptyTitle>No audio selected</EmptyTitle>
          <EmptyDescription className="text-xs">
            Add an audio source URL or drag an audio file here
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
          <div className="bg-background/90 p-4 rounded-lg shadow-lg">
            <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Drop to add audio</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioComponent;
