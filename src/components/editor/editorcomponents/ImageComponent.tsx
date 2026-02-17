"use client";

import React, { useState, useEffect } from "react";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
  EmptyDescription,
} from "@/components/ui/empty";
import { ImageIcon, Upload } from "lucide-react";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { ImageDragDataSchema } from "@/schema/zod/imageupload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImageSettings } from "@/interfaces/elements.interface";
import { useParams } from "next/navigation";

type Props = EditorComponentProps;

const ImageComponent: React.FC<Props> = ({ element, data }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const updateElement = useUpdateElement();
  const { id } = useParams();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: id as string,
    });
  const safeStyles = elementHelper.getSafeStyles(element);

  // Get image settings with type assertion
  const imageSettings = (
    element.type === "Image" ? element.settings : null
  ) as ImageSettings | null;
  const objectFit = imageSettings?.objectFit ?? "cover";
  const loading = imageSettings?.loading ?? "lazy";
  const decoding = imageSettings?.decoding ?? "async";

  const imageStyle: React.CSSProperties = {
    objectFit: objectFit as React.CSSProperties["objectFit"],
  };

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

      // Validate the drag data
      const validatedData = ImageDragDataSchema.parse(parsedData);

      if (validatedData.type === "image") {
        // Update the element with the new image
        updateElement(element.id, {
          ...element,
          src: validatedData.imageLink,
          name: validatedData.imageName || "Image",
        });

        toast.success("Image updated successfully!");
      }
    } catch (error) {
      console.error("Drop error:", error);
      toast.error("Failed to update image");
    }
  };

  // Register events when element events change
  useEffect(() => {
    if (element.events) {
      registerEvents(element.events);
    }
  }, [element.events, registerEvents]);

  const eventHandlers = createEventHandlers();

  return element.src ? (
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
        cursor: eventsActive ? "pointer" : "inherit",
        userSelect: eventsActive ? "none" : "auto",
      }}
    >
      <img
        src={element.src}
        alt={element.name || "Image"}
        style={imageStyle}
        loading={loading}
        decoding={decoding}
        role="img"
        className="w-full h-full"
      />
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
          <div className="bg-background/90 p-4 rounded-lg shadow-lg">
            <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Drop to replace image</p>
          </div>
        </div>
      )}
    </div>
  ) : (
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
        cursor: eventsActive ? "pointer" : "inherit",
        userSelect: eventsActive ? "none" : "auto",
      }}
    >
      <Empty className="w-full h-full">
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
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
          <div className="bg-background/90 p-4 rounded-lg shadow-lg">
            <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Drop to add image</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageComponent;
