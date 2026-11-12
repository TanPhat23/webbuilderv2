
import { useState } from "react";
import { useImageStore } from "@/features/editor";
import { Button } from "@/components/ui/button";
import { ImageIcon, Plus, X } from "lucide-react";
import PanelIntro from "@/features/editor/components/layout/PanelIntro";
import { ImageDragDataSchema } from "@/features/images/schema/imageupload";
import { ImageManagerDialog } from "@/features/images/components/ImageManagerDialog";

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
    <div className="flex flex-col gap-2 p-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-full gap-2 text-xs"
        onClick={() => setDialogOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        {selectedImages.length === 0 ? "Add images" : "Manage images"}
      </Button>

      {selectedImages.length === 0 ? (
        <PanelIntro
          icon={ImageIcon}
          title="No images yet"
          description="Upload or pick images, then drag them onto the canvas."
        />
      ) : (
        <>
          <p className="px-0.5 text-[11px] text-muted-foreground">
            {selectedImages.length} image{selectedImages.length !== 1 ? "s" : ""} · drag onto the canvas
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {selectedImages.map((image) => (
              <div
                key={image.imageId}
                draggable
                onDragStart={(e) => handleDragStart(e, image)}
                title={image.imageName ?? undefined}
                className="group relative aspect-square cursor-grab overflow-hidden rounded-md border border-border bg-muted/40 transition-colors hover:border-primary/60 active:cursor-grabbing"
              >
                <img
                  src={image.imageLink}
                  alt={image.imageName || "Image"}
                  className="h-full w-full object-cover"
                  draggable={false}
                  loading="lazy"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label="Remove from panel"
                  className="absolute right-1 top-1 h-5 w-5 opacity-0 shadow-sm transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                  onClick={(e) => handleRemoveImage(image.imageId, e)}
                >
                  <X className="h-3 w-3" />
                </Button>
                {image.imageName && (
                  <div className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1 pt-3 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {image.imageName}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Image Manager Dialog */}
      <ImageManagerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
