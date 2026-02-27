import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { imageService } from "@/features/images";
import { Image, ImageUploadResponse } from "@/features/images";
import { QUERY_CONFIG } from "@/utils/query/queryConfig";
import { showErrorToast, showSuccessToast } from "@/utils/errors/errorToast";
import { getErrorMessage, onMutationError } from "@/hooks/utils/mutationUtils";
import {
  ImageFileSchema,
  Base64ImageSchema,
  ImageUploadResponseSchema,
  ImagesArraySchema,
} from "@/features/images/schema/imageupload";

// Query keys
export const imageKeys = {
  all: ["images"] as const,
  lists: () => [...imageKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...imageKeys.lists(), filters] as const,
  details: () => [...imageKeys.all, "detail"] as const,
  detail: (id: string) => [...imageKeys.details(), id] as const,
};

/** Hook to get all user images. */
export function useUserImages() {
  return useQuery({
    queryKey: imageKeys.lists(),
    queryFn: async () => {
      const images = await imageService.getUserImages();
      // Validate response
      return ImagesArraySchema.parse(images);
    },
    ...QUERY_CONFIG.DEFAULT,
  });
}

/** Hook to get a specific image by ID. */
export function useImage(imageId: string | null) {
  return useQuery({
    queryKey: imageKeys.detail(imageId || ""),
    queryFn: async () => {
      if (!imageId) throw new Error("Image ID is required");
      const image = await imageService.getImageByID(imageId);
      return image;
    },
    enabled: !!imageId,
  });
}

/** Hook to upload an image file. */
export function useUploadImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      imageName,
    }: {
      file: File;
      imageName?: string;
    }) => {
      // Validate input
      ImageFileSchema.parse({ file, imageName });

      const response = await imageService.uploadImage(file, imageName);

      // Validate response
      return ImageUploadResponseSchema.parse(response);
    },
    onSuccess: (data) => {
      // Invalidate and refetch images list
      queryClient.invalidateQueries({ queryKey: imageKeys.lists() });

      // Optimistically add to cache
      queryClient.setQueryData<Image[]>(imageKeys.lists(), (old) => {
        const newImage: Image = {
          imageId: data.imageId,
          imageLink: data.imageLink,
          imageName: data.imageName,
          userId: "",
          createdAt: data.createdAt,
          updatedAt: data.createdAt,
          deletedAt: null,
        };
        return old ? [newImage, ...old] : [newImage];
      });

      showSuccessToast("Image uploaded successfully!");
    },
    onError: onMutationError("Failed to upload image"),
  });
}

/** Hook to upload a base64 image. */
export function useUploadBase64Image() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      base64,
      imageName,
    }: {
      base64: string;
      imageName?: string;
    }) => {
      // Validate input
      Base64ImageSchema.parse({ base64, imageName });

      const response = await imageService.uploadBase64Image(base64, imageName);

      // Validate response
      return ImageUploadResponseSchema.parse(response);
    },
    onSuccess: (data) => {
      // Invalidate and refetch images list
      queryClient.invalidateQueries({ queryKey: imageKeys.lists() });

      // Optimistically add to cache
      queryClient.setQueryData<Image[]>(imageKeys.lists(), (old) => {
        const newImage: Image = {
          imageId: data.imageId,
          imageLink: data.imageLink,
          imageName: data.imageName,
          userId: "",
          createdAt: data.createdAt,
          updatedAt: data.createdAt,
          deletedAt: null,
        };
        return old ? [newImage, ...old] : [newImage];
      });

      showSuccessToast("Image uploaded successfully!");
    },
    onError: onMutationError("Failed to upload image"),
  });
}

/** Hook to delete an image. */
export function useDeleteImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: string) => {
      await imageService.deleteImage(imageId);
      return imageId;
    },
    onMutate: async (imageId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: imageKeys.lists() });

      // Snapshot the previous value
      const previousImages = queryClient.getQueryData<Image[]>(
        imageKeys.lists(),
      );

      // Optimistically update to remove the image
      queryClient.setQueryData<Image[]>(imageKeys.lists(), (old) =>
        old ? old.filter((img) => img.imageId !== imageId) : [],
      );

      // Return context with snapshot
      return { previousImages };
    },
    onSuccess: () => {
      showSuccessToast("Image deleted successfully!");
    },
    onError: (error, _imageId, context) => {
      // Rollback on error
      if (context?.previousImages) {
        queryClient.setQueryData(imageKeys.lists(), context.previousImages);
      }
      showErrorToast(getErrorMessage(error, "Failed to delete image"));
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: imageKeys.lists() });
    },
  });
}
