"use client";

import { useState, useCallback } from "react";
import { useUpdateElement } from "@/features/editor";
import { toast } from "sonner";
import type { EditorElement } from "@/types/global.type";

type MediaType = "image" | "video" | "audio";

const SRC_KEY: Record<MediaType, string> = {
  image: "imageLink",
  video: "videoLink",
  audio: "audioLink",
};

const NAME_KEY: Record<MediaType, string> = {
  image: "imageName",
  video: "videoName",
  audio: "audioName",
};

interface UseMediaDropOptions {
  element: EditorElement;
  mediaType: MediaType;
}

export function useMediaDrop({ element, mediaType }: UseMediaDropOptions) {
  const [isDragOver, setIsDragOver] = useState(false);
  const updateElement = useUpdateElement();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      try {
        const raw = e.dataTransfer.getData("application/json");
        if (!raw) {
          toast.error("Invalid drag data");
          return;
        }

        const payload = JSON.parse(raw) as Record<string, unknown>;
        const src = payload[SRC_KEY[mediaType]];

        if (payload.type !== mediaType || typeof src !== "string") return;

        const nameKey = NAME_KEY[mediaType];
        const name =
          typeof payload[nameKey] === "string"
            ? (payload[nameKey] as string)
            : mediaType.charAt(0).toUpperCase() + mediaType.slice(1);

        updateElement(element.id, { ...element, src, name });
        toast.success(`${name} updated successfully!`);
      } catch (error) {
        console.error("Drop error:", error);
        toast.error(`Failed to update ${mediaType}`);
      }
    },
    [element, mediaType, updateElement],
  );

  return { isDragOver, handleDragOver, handleDragLeave, handleDrop };
}
