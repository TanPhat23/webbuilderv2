"use client";

import { useState } from "react";
import Image from "next/image";
import { useUserImages, useUploadImage, useDeleteImage } from "@/hooks/images";
import { useImageStore } from "@/globalstore/image-store";
import { Image as ImageType } from "@/interfaces/image.interface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  Loader2,
  Image as ImageIcon,
  Trash2,
  Check,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageManagerDialog({
  open,
  onOpenChange,
}: ImageManagerDialogProps) {
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("gallery");

  const { data: images = [], isLoading } = useUserImages();
  const uploadMutation = useUploadImage();
  const deleteMutation = useDeleteImage();

  const {
    selectedImages,
    isImageSelected,
    toggleImageSelection,
    deselectImage,
  } = useImageStore();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    try {
      await uploadMutation.mutateAsync({
        file,
        imageName: file.name,
      });

      event.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteMutation.mutateAsync(imageId);

      if (isImageSelected(imageId)) {
        deselectImage(imageId);
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleteImageId(null);
    }
  };

  const handleImageClick = (image: ImageType) => {
    toggleImageSelection(image);
  };

  const selectedCount = selectedImages.length;
  const galleryImages = images;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Image Manager</DialogTitle>
            <DialogDescription>
              Upload, manage, and select images for your project. Selected
              images will appear in the sidebar.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gallery">
                Gallery ({galleryImages.length})
              </TabsTrigger>
              <TabsTrigger value="selected">
                Selected ({selectedCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="gallery"
              className="flex-1 flex flex-col min-h-0 mt-4"
            >
              {/* Upload Section */}
              <div className="mb-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploadMutation.isPending}
                  className="hidden"
                  id="dialog-image-upload-input"
                />
                <label htmlFor="dialog-image-upload-input">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer"
                    disabled={uploadMutation.isPending}
                    asChild
                  >
                    <span>
                      {uploadMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload New Image
                        </>
                      )}
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Max size: 5MB • Supported: JPG, PNG, GIF, WebP
                </p>
              </div>

              {/* Gallery Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : galleryImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold mb-1">No images yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Upload your first image to get started. Images will be
                    stored securely and accessible across your projects.
                  </p>
                </div>
              ) : (
                <ScrollArea className="flex-1">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pb-2">
                    {galleryImages.map((image) => {
                      const selected = isImageSelected(image.imageId);
                      return (
                        <div
                          key={image.imageId}
                          className={`group relative aspect-square overflow-hidden rounded-lg border-2 cursor-pointer transition-all ${
                            selected
                              ? "border-primary ring-2 ring-primary ring-offset-2"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => handleImageClick(image)}
                        >
                          <Image
                            src={image.imageLink}
                            alt={image.imageName || "Uploaded image"}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          {selected && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteImageId(image.imageId);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {image.imageName && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs p-2 truncate">
                              {image.imageName}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent
              value="selected"
              className="flex-1 flex flex-col min-h-0 mt-4"
            >
              {selectedImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold mb-1">
                    No images selected
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Click on images in the gallery to select them. Selected
                    images will appear in the sidebar for easy access.
                  </p>
                </div>
              ) : (
                <ScrollArea className="flex-1">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pb-2">
                    {selectedImages.map((image) => (
                      <div
                        key={image.imageId}
                        className="group relative aspect-square overflow-hidden rounded-lg border-2 border-primary ring-2 ring-primary ring-offset-2"
                      >
                        <Image
                          src={image.imageLink}
                          alt={image.imageName || "Selected image"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleImageSelection(image)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {image.imageName && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs p-2 truncate">
                            {image.imageName}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteImageId !== null}
        onOpenChange={(open) => !open && setDeleteImageId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone and will remove the image from all projects using it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteImageId && handleDeleteImage(deleteImageId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
