"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Image } from "@/interfaces/image.interface";

/**
 * ImageStore (client / persisted)
 *
 * This store manages selected images for the editor.
 * Selected images are persisted to localStorage and will be available
 * across sessions. The store only holds references to selected images,
 * not the full gallery.
 *
 * Public API:
 * - selectedImages: Image[] - Array of currently selected images
 * - selectImage(image) - Add an image to selected images
 * - deselectImage(imageId) - Remove an image from selected images
 * - clearSelectedImages() - Clear all selected images
 * - isImageSelected(imageId) - Check if an image is selected
 */

type ImageStoreState = {
  selectedImages: Image[];
  selectImage: (image: Image) => void;
  deselectImage: (imageId: string) => void;
  clearSelectedImages: () => void;
  isImageSelected: (imageId: string) => boolean;
  toggleImageSelection: (image: Image) => void;
  removeDeletedImages: (imageIds: string[]) => void;
  updateImageInStore: (imageId: string, updates: Partial<Image>) => void;
};

export const useImageStore = create<ImageStoreState>()(
  persist(
    (set, get) => ({
      selectedImages: [],

      selectImage: (image: Image) => {
        set((state) => {
          const exists = state.selectedImages.some(
            (img) => img.imageId === image.imageId,
          );
          if (exists) {
            return state;
          }
          return {
            selectedImages: [...state.selectedImages, image],
          };
        });
      },

      deselectImage: (imageId: string) => {
        set((state) => ({
          selectedImages: state.selectedImages.filter(
            (img) => img.imageId !== imageId,
          ),
        }));
      },

      clearSelectedImages: () => {
        set({ selectedImages: [] });
      },

      isImageSelected: (imageId: string) => {
        return get().selectedImages.some((img) => img.imageId === imageId);
      },

      toggleImageSelection: (image: Image) => {
        const { isImageSelected, selectImage, deselectImage } = get();
        if (isImageSelected(image.imageId)) {
          deselectImage(image.imageId);
        } else {
          selectImage(image);
        }
      },

      removeDeletedImages: (imageIds: string[]) => {
        set((state) => ({
          selectedImages: state.selectedImages.filter(
            (img) => !imageIds.includes(img.imageId),
          ),
        }));
      },

      updateImageInStore: (imageId: string, updates: Partial<Image>) => {
        set((state) => ({
          selectedImages: state.selectedImages.map((img) =>
            img.imageId === imageId ? { ...img, ...updates } : img,
          ),
        }));
      },
    }),
    {
      name: "image-selection-storage", // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the selectedImages array
      partialize: (state) => ({ selectedImages: state.selectedImages }),
    },
  ),
);
