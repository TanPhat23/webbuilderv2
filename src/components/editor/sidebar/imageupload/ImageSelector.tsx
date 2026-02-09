"use client";

import { useState } from "react";
import Image from "next/image";
import { useImageStore } from "@/globalstore/image-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageIcon, Plus, X, GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ImageDragDataSchema } from "@/schema/zod/imageupload";
import { ImageManagerDialog } from "@/components/editor/sidebar/imageupload/ImageManagerDialog";

export function ImageSelector() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { selectedImages, deselectImage } = useImageStore();

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    image: { imageId: string; imageLink: string; imageName?: string | null },
  ) => {
    const dragData = {
      imageId: image.imageId,
      imageLink: image.imageLink,
      imageName: image.imageName,
      type: "image" as const,
    };

    const validatedData = ImageDragDataSchema.parse(dragData);

    event.dataTransfer.setData(
      "application/json",
      JSON.stringify(validatedData),
    );
    event.dataTransfer.effectAllowed = "copy";

    const dragImage = event.currentTarget.querySelector("img");
    if (dragImage) {
      event.dataTransfer.setDragImage(dragImage, 50, 50);
    }
  };

  const handleRemoveImage = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deselectImage(imageId);
  };

  return (
    <div className="space-y-3">
      {/* Add Images Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setDialogOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Manage Images
      </Button>

      {/* Selected Images Display */}
      {selectedImages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No images selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click "Manage Images" to add images
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {selectedImages.length} selected image
            {selectedImages.length !== 1 ? "s" : ""} • Drag to use
          </p>
          <ScrollArea className="h-[300px] rounded-md border">
            <div className="grid grid-cols-2 gap-2 p-2">
              {selectedImages.map((image) => (
                <div
                  key={image.imageId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, image)}
                  className="group relative aspect-square overflow-hidden rounded-lg border-2 border-transparent hover:border-primary cursor-grab active:cursor-grabbing transition-all"
                >
                  <Image
                    src={image.imageLink}
                    alt={image.imageName || "Selected image"}
                    fill
                    className="object-cover"
                    draggable={false}
                    unoptimized
                  />

                  {/* Drag Indicator */}
                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded p-0.5">
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleRemoveImage(image.imageId, e)}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {/* Image Name */}
                  {image.imageName && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                      {image.imageName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Image Manager Dialog */}
      <ImageManagerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
