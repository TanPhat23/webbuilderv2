
import React from "react";
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

const ImageComponent: React.FC<EditorComponentProps> = ({ element }) => {
  const { rootProps } = useCanvasElement(element);
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
      className={cn(
        rootProps.className,
        isDragOver && "ring-2 ring-primary ring-offset-2",
      )}
    >
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
      {isDragOver && <DropOverlay label="Drop to add image" />}
    </div>
  );
};

export default ImageComponent;
