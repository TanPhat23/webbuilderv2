"use client";

import React from "react";
import { EditorComponentProps } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { AudioElement, AudioSettings } from "@/features/editor";
import { useElementHandler } from "@/hooks";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
  EmptyDescription,
} from "@/components/ui/empty";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useEditorElement,
  eventsStyle,
  useMediaDrop,
  DropOverlay,
} from "./shared";

const AudioComponent = ({ element }: EditorComponentProps) => {
  const audioElement = element as AudioElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });
  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } =
    useMediaDrop({
      element,
      mediaType: "audio",
    });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(audioElement);

  const settings = (audioElement.settings ?? {}) as AudioSettings;
  const controls = settings.controls ?? true;
  const autoplay = settings.autoplay ?? false;
  const loop = settings.loop ?? false;
  const muted = settings.muted ?? false;
  const preload = settings.preload ?? "metadata";

  const dragHandlers = {
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };

  const wrapperProps = {
    ref: elementRef as React.RefObject<HTMLDivElement>,
    "data-element-id": element.id,
    "data-element-type": element.type,
    ...getCommonProps(audioElement),
    ...eventHandlers,
    ...dragHandlers,
  };

  if (audioElement.src) {
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
        <audio
          src={audioElement.src}
          controls={controls}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          preload={preload}
          style={{ width: "100%" }}
        />
        {isDragOver && <DropOverlay label="Drop to replace audio" />}
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
            <Volume2 />
          </EmptyMedia>
          <EmptyTitle>No audio selected</EmptyTitle>
          <EmptyDescription className="text-xs">
            Add an audio source URL or drag an audio file here
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
      {isDragOver && <DropOverlay label="Drop to add audio" />}
    </div>
  );
};

export default AudioComponent;
