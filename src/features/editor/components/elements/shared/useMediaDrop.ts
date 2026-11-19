
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

/** Media library drags carry JSON; canvas element drags do not. */
const isMediaDrag = (e: React.DragEvent<HTMLElement>) =>
  Array.from(e.dataTransfer.types).includes("application/json");

export function useMediaDrop({ element, mediaType }: UseMediaDropOptions) {
  const [dragTarget, setDragTarget] = useState<HTMLElement | null>(null);
  const updateElement = useUpdateElement();

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    // Element moves and palette drags belong to the canvas, not this media slot.
    if (!isMediaDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    setDragTarget(e.currentTarget);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    if (!isMediaDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    setDragTarget(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      if (!isMediaDrag(e)) return;
      e.preventDefault();
      e.stopPropagation();
      setDragTarget(null);

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

  return { isDragOver: dragTarget !== null, dragTarget, handleDragOver, handleDragLeave, handleDrop };
}
