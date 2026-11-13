
import React from "react";
import { EditorComponentProps } from "@/features/editor";
import { AudioElement, AudioSettings } from "@/features/editor";
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
  useCanvasElement,
  useMediaDrop,
  DropOverlay,
} from "./shared";

const AudioComponent = ({ element }: EditorComponentProps) => {
  const audioElement = element as AudioElement;
  const { rootProps } = useCanvasElement(audioElement);
  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } =
    useMediaDrop({
      element,
      mediaType: "audio",
    });

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

  const wrapperProps = { ...rootProps, ...dragHandlers };

  if (audioElement.src) {
    return (
      <div
        {...wrapperProps}
        className={cn(
          rootProps.className,
          "relative",
          isDragOver && "ring-2 ring-primary ring-offset-2",
        )}
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
        rootProps.className,
        isDragOver && "ring-2 ring-primary ring-offset-2",
      )}
    >
      <Empty className="w-full h-full min-w-56 md:p-6">
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
