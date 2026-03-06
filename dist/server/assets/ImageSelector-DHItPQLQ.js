import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { X as QUERY_CONFIG, aE as ImagesArraySchema, W as onMutationError, ad as showSuccessToast, aF as ImageFileSchema, aG as ImageUploadResponseSchema, aq as showErrorToast, aA as getErrorMessage, aH as useImageStore, J as Dialog, K as DialogContent, L as DialogHeader, M as DialogTitle, N as DialogDescription, T as Tabs, g as TabsList, h as TabsTrigger, i as TabsContent, I as Input, B as Button, Q as DialogFooter, aI as ImageDragDataSchema } from "./prisma-Cq49YOYM.js";
import { S as ScrollArea } from "./scroll-area-BYa8i-Jn.js";
import { Loader2, Upload, Image, Check, Trash2, X, Plus, ImageIcon, GripVertical } from "lucide-react";
import { C as Card, a as CardContent } from "./card-LOcGasZb.js";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { i as imageService } from "./image.service-Bx1S5OlL.js";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-DXOCWecy.js";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "sonner";
import "uuid";
import "clsx";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
import "@hookform/resolvers/zod";
import "react-hook-form";
import "next-themes";
import "socket.io-client";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
const imageKeys = {
  all: ["images"],
  lists: () => [...imageKeys.all, "list"],
  list: (filters) => [...imageKeys.lists(), filters],
  details: () => [...imageKeys.all, "detail"],
  detail: (id) => [...imageKeys.details(), id]
};
function useUserImages() {
  return useQuery({
    queryKey: imageKeys.lists(),
    queryFn: async () => {
      const images = await imageService.getUserImages();
      return ImagesArraySchema.parse(images);
    },
    ...QUERY_CONFIG.DEFAULT
  });
}
function useUploadImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      imageName
    }) => {
      ImageFileSchema.parse({ file, imageName });
      const response = await imageService.uploadImage(file, imageName);
      return ImageUploadResponseSchema.parse(response);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: imageKeys.lists() });
      queryClient.setQueryData(imageKeys.lists(), (old) => {
        const newImage = {
          imageId: data.imageId,
          imageLink: data.imageLink,
          imageName: data.imageName,
          userId: "",
          createdAt: data.createdAt,
          updatedAt: data.createdAt,
          deletedAt: null
        };
        return old ? [newImage, ...old] : [newImage];
      });
      showSuccessToast("Image uploaded successfully!");
    },
    onError: onMutationError("Failed to upload image")
  });
}
function useDeleteImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (imageId) => {
      await imageService.deleteImage(imageId);
      return imageId;
    },
    onMutate: async (imageId) => {
      await queryClient.cancelQueries({ queryKey: imageKeys.lists() });
      const previousImages = queryClient.getQueryData(
        imageKeys.lists()
      );
      queryClient.setQueryData(
        imageKeys.lists(),
        (old) => old ? old.filter((img) => img.imageId !== imageId) : []
      );
      return { previousImages };
    },
    onSuccess: () => {
      showSuccessToast("Image deleted successfully!");
    },
    onError: (error, _imageId, context) => {
      if (context?.previousImages) {
        queryClient.setQueryData(imageKeys.lists(), context.previousImages);
      }
      showErrorToast(getErrorMessage(error, "Failed to delete image"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.lists() });
    }
  });
}
function ImageManagerDialog({
  open,
  onOpenChange
}) {
  const [deleteImageId, setDeleteImageId] = useState(null);
  const [activeTab, setActiveTab] = useState("gallery");
  const { data: images = [], isLoading } = useUserImages();
  const uploadMutation = useUploadImage();
  const deleteMutation = useDeleteImage();
  const {
    selectedImages,
    isImageSelected,
    toggleImageSelection,
    deselectImage
  } = useImageStore();
  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      await uploadMutation.mutateAsync({
        file,
        imageName: file.name
      });
      event.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
    }
  };
  const handleDeleteImage = async (imageId) => {
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
  const handleImageClick = (image) => {
    toggleImageSelection(image);
  };
  const selectedCount = selectedImages.length;
  const galleryImages = images;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-4xl max-h-[85vh] flex flex-col", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Image Manager" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Upload, manage, and select images for your project. Selected images will appear in the sidebar." })
      ] }),
      /* @__PURE__ */ jsxs(
        Tabs,
        {
          value: activeTab,
          onValueChange: setActiveTab,
          className: "flex-1 flex flex-col min-h-0",
          children: [
            /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [
              /* @__PURE__ */ jsxs(TabsTrigger, { value: "gallery", children: [
                "Gallery (",
                galleryImages.length,
                ")"
              ] }),
              /* @__PURE__ */ jsxs(TabsTrigger, { value: "selected", children: [
                "Selected (",
                selectedCount,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxs(
              TabsContent,
              {
                value: "gallery",
                className: "flex-1 flex flex-col min-h-0 mt-4",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        type: "file",
                        accept: "image/*",
                        onChange: handleFileSelect,
                        disabled: uploadMutation.isPending,
                        className: "hidden",
                        id: "dialog-image-upload-input"
                      }
                    ),
                    /* @__PURE__ */ jsx("label", { htmlFor: "dialog-image-upload-input", children: /* @__PURE__ */ jsx(
                      Button,
                      {
                        type: "button",
                        variant: "outline",
                        className: "w-full cursor-pointer",
                        disabled: uploadMutation.isPending,
                        asChild: true,
                        children: /* @__PURE__ */ jsx("span", { children: uploadMutation.isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
                          /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                          "Uploading..."
                        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                          /* @__PURE__ */ jsx(Upload, { className: "mr-2 h-4 w-4" }),
                          "Upload New Image"
                        ] }) })
                      }
                    ) }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground text-center mt-2", children: "Max size: 5MB • Supported: JPG, PNG, GIF, WebP" })
                  ] }),
                  isLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : galleryImages.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center", children: [
                    /* @__PURE__ */ jsx(Image, { className: "h-16 w-16 text-muted-foreground mb-3" }),
                    /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-1", children: "No images yet" }),
                    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground max-w-sm", children: "Upload your first image to get started. Images will be stored securely and accessible across your projects." })
                  ] }) : /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pb-2", children: galleryImages.map((image) => {
                    const selected = isImageSelected(image.imageId);
                    return /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: `group relative aspect-square overflow-hidden rounded-lg border-2 cursor-pointer transition-all ${selected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border hover:border-primary/50"}`,
                        onClick: () => handleImageClick(image),
                        children: [
                          /* @__PURE__ */ jsx(
                            "img",
                            {
                              src: image.imageLink,
                              alt: image.imageName || "Uploaded image",
                              className: "object-cover w-full h-full"
                            }
                          ),
                          selected && /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1", children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }),
                          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2", children: /* @__PURE__ */ jsx(
                            Button,
                            {
                              variant: "destructive",
                              size: "icon",
                              className: "h-8 w-8",
                              onClick: (e) => {
                                e.stopPropagation();
                                setDeleteImageId(image.imageId);
                              },
                              children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                            }
                          ) }),
                          image.imageName && /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs p-2 truncate", children: image.imageName })
                        ]
                      },
                      image.imageId
                    );
                  }) }) })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              TabsContent,
              {
                value: "selected",
                className: "flex-1 flex flex-col min-h-0 mt-4",
                children: selectedImages.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center", children: [
                  /* @__PURE__ */ jsx(Image, { className: "h-16 w-16 text-muted-foreground mb-3" }),
                  /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-1", children: "No images selected" }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground max-w-sm", children: "Click on images in the gallery to select them. Selected images will appear in the sidebar for easy access." })
                ] }) : /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pb-2", children: selectedImages.map((image) => /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "group relative aspect-square overflow-hidden rounded-lg border-2 border-primary ring-2 ring-primary ring-offset-2",
                    children: [
                      /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: image.imageLink,
                          alt: image.imageName || "Selected image",
                          className: "object-cover w-full h-full"
                        }
                      ),
                      /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1", children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }),
                      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2", children: /* @__PURE__ */ jsx(
                        Button,
                        {
                          variant: "secondary",
                          size: "icon",
                          className: "h-8 w-8",
                          onClick: () => toggleImageSelection(image),
                          children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
                        }
                      ) }),
                      image.imageName && /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs p-2 truncate", children: image.imageName })
                    ]
                  },
                  image.imageId
                )) }) })
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsx(
      AlertDialog,
      {
        open: deleteImageId !== null,
        onOpenChange: (open2) => !open2 && setDeleteImageId(null),
        children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Delete Image" }),
            /* @__PURE__ */ jsx(AlertDialogDescription, { children: "Are you sure you want to delete this image? This action cannot be undone and will remove the image from all projects using it." })
          ] }),
          /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
            /* @__PURE__ */ jsx(
              AlertDialogAction,
              {
                onClick: () => deleteImageId && handleDeleteImage(deleteImageId),
                className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                disabled: deleteMutation.isPending,
                children: deleteMutation.isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                  "Deleting..."
                ] }) : "Delete"
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
function ImageSelector() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { selectedImages, deselectImage } = useImageStore();
  const handleDragStart = (event, image) => {
    const dragData = {
      imageId: image.imageId,
      imageLink: image.imageLink,
      imageName: image.imageName,
      type: "image"
    };
    const validatedData = ImageDragDataSchema.parse(dragData);
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify(validatedData)
    );
    event.dataTransfer.effectAllowed = "copy";
    const dragImage = event.currentTarget.querySelector("img");
    if (dragImage) {
      event.dataTransfer.setDragImage(dragImage, 50, 50);
    }
  };
  const handleRemoveImage = (imageId, e) => {
    e.stopPropagation();
    deselectImage(imageId);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "outline",
        className: "w-full",
        onClick: () => setDialogOpen(true),
        children: [
          /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
          "Manage Images"
        ]
      }
    ),
    selectedImages.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col items-center justify-center py-8 text-center", children: [
      /* @__PURE__ */ jsx(ImageIcon, { className: "h-12 w-12 text-muted-foreground mb-2" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No images selected" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: 'Click "Manage Images" to add images' })
    ] }) }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
        selectedImages.length,
        " selected image",
        selectedImages.length !== 1 ? "s" : "",
        " • Drag to use"
      ] }),
      /* @__PURE__ */ jsx(ScrollArea, { className: "h-[300px] rounded-md border", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2 p-2", children: selectedImages.map((image) => /* @__PURE__ */ jsxs(
        "div",
        {
          draggable: true,
          onDragStart: (e) => handleDragStart(e, image),
          className: "group relative aspect-square overflow-hidden rounded-lg border-2 border-transparent hover:border-primary cursor-grab active:cursor-grabbing transition-all",
          children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: image.imageLink,
                alt: image.imageName || "Selected image",
                className: "object-cover w-full h-full",
                draggable: false
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded p-0.5", children: /* @__PURE__ */ jsx(GripVertical, { className: "h-3 w-3 text-muted-foreground" }) }),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "destructive",
                size: "icon",
                className: "absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                onClick: (e) => handleRemoveImage(image.imageId, e),
                children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" })
              }
            ),
            image.imageName && /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate", children: image.imageName })
          ]
        },
        image.imageId
      )) }) })
    ] }),
    /* @__PURE__ */ jsx(ImageManagerDialog, { open: dialogOpen, onOpenChange: setDialogOpen })
  ] });
}
export {
  ImageSelector
};
