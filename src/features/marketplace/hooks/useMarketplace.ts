"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceService } from "../services/marketplace.service";
import {
  MarketplaceItemWithRelations,
  MarketplaceFilters,
  CreateMarketplaceItemRequest,
  UpdateMarketplaceItemRequest,
} from "@/features/marketplace";
import { QUERY_CONFIG } from "@/utils/query/queryConfig";
import { showSuccessToast } from "@/utils/errors/errorToast";
import { onMutationError } from "@/hooks/utils/mutationUtils";

export const marketplaceKeys = {
  all: ["marketplace"] as const,
  items: () => [...marketplaceKeys.all, "items"] as const,
  itemsList: (filters?: MarketplaceFilters) =>
    [...marketplaceKeys.items(), { filters }] as const,
  item: (id: string) => [...marketplaceKeys.items(), id] as const,
  categories: () => [...marketplaceKeys.all, "categories"] as const,
  tags: () => [...marketplaceKeys.all, "tags"] as const,
};

/** Hook to get marketplace items with optional filters. */
export function useMarketplaceItems(filters?: MarketplaceFilters) {
  return useQuery({
    queryKey: marketplaceKeys.itemsList(filters),
    queryFn: async () => {
      try {
        const result = await marketplaceService.getMarketplaceItems(filters);
        const items = Array.isArray(result) ? result : [];
        return items;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch marketplace items:", error);
        return [];
      }
    },
    ...QUERY_CONFIG.DEFAULT,
  });
}

/** Hook to get a single marketplace item by ID. */
export function useMarketplaceItem(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: marketplaceKeys.item(id),
    queryFn: async () => {
      try {
        return await marketplaceService.getMarketplaceItemByID(id);
      } catch (error) {
        // Don't log 404 errors for deleted items
        if (error instanceof Error && !error.message.includes("404")) {
          // eslint-disable-next-line no-console
          console.error("Failed to fetch marketplace item:", error);
        }
        throw error;
      }
    },
    enabled: enabled && !!id,
    ...QUERY_CONFIG.DEFAULT,
    retry: false, // Don't retry on 404 errors
  });
}

/** Hook to create a new marketplace item. */
export function useCreateMarketplaceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMarketplaceItemRequest) =>
      marketplaceService.createMarketplaceItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.items() });
      showSuccessToast("Template created successfully!");
    },
    onError: onMutationError("Failed to create template"),
  });
}

/** Hook to update an existing marketplace item. */
export function useUpdateMarketplaceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMarketplaceItemRequest;
    }) => marketplaceService.updateMarketplaceItem(id, data),
    onSuccess: (updatedItem, variables) => {
      queryClient.setQueryData(marketplaceKeys.item(variables.id), updatedItem);
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.items() });
      showSuccessToast("Template updated successfully!");
    },
    onError: onMutationError("Failed to update template"),
  });
}

/** Hook to delete a marketplace item. */
export function useDeleteMarketplaceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => marketplaceService.deleteMarketplaceItem(id),
    onSuccess: (_, id) => {
      // Remove the specific item from cache to prevent 404 errors
      queryClient.removeQueries({ queryKey: marketplaceKeys.item(id) });

      // Invalidate all marketplace items lists to refetch without deleted item
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.items() });

      // Also invalidate the generic marketplace items query that ProjectCard uses
      queryClient.invalidateQueries({ queryKey: ["marketplaceItems"] });

      showSuccessToast("Template deleted successfully!");
    },
    onError: onMutationError("Failed to delete template"),
  });
}

/** Hook to increment download count for a marketplace item. */
export function useIncrementDownloads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => marketplaceService.incrementDownloads(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        marketplaceKeys.item(id),
        (old: MarketplaceItemWithRelations | undefined) => {
          if (!old) return old;
          return {
            ...old,
            downloads: (old.downloads || 0) + 1,
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.item(id) });
    },
    onError: onMutationError("Failed to record download"),
  });
}

/** Hook to download a marketplace item (creates a new project from the template). */
export function useDownloadMarketplaceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (marketplaceItemId: string) => {
      const newProject =
        await marketplaceService.downloadMarketplaceItem(marketplaceItemId);
      return newProject;
    },
    onSuccess: (newProject, marketplaceItemId) => {
      // Invalidate projects query to show the new project
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      // Update the marketplace item download count
      queryClient.setQueryData(
        marketplaceKeys.item(marketplaceItemId),
        (old: MarketplaceItemWithRelations | undefined) => {
          if (!old) return old;
          return {
            ...old,
            downloads: (old.downloads || 0) + 1,
          };
        },
      );

      showSuccessToast(
        `Template downloaded! Created project: ${newProject.name}`,
      );
    },
    onError: onMutationError("Failed to download template"),
  });
}

/** Hook to increment like count for a marketplace item. */
export function useIncrementLikes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => marketplaceService.incrementLikes(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        marketplaceKeys.item(id),
        (old: MarketplaceItemWithRelations | undefined) => {
          if (!old) return old;
          return {
            ...old,
            likes: (old.likes || 0) + 1,
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.item(id) });
      showSuccessToast("Thanks for liking this template!");
    },
    onError: onMutationError("Failed to like template"),
  });
}

/** Hook to get all marketplace categories. */
export function useCategories() {
  return useQuery({
    queryKey: marketplaceKeys.categories(),
    queryFn: async () => {
      try {
        const result = await marketplaceService.getCategories();
        const cats = Array.isArray(result) ? result : [];
        return cats;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch categories:", error);
        return [];
      }
    },
    ...QUERY_CONFIG.LONG,
  });
}

/** Hook to create a new category. */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => marketplaceService.createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.categories() });
      showSuccessToast("Category created successfully!");
    },
    onError: onMutationError("Failed to create category"),
  });
}

/** Hook to delete a category. */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => marketplaceService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.categories() });
      showSuccessToast("Category deleted successfully!");
    },
    onError: onMutationError("Failed to delete category"),
  });
}

/** Hook to get all marketplace tags. */
export function useTags() {
  return useQuery({
    queryKey: marketplaceKeys.tags(),
    queryFn: async () => {
      try {
        const result = await marketplaceService.getTags();
        const tags = Array.isArray(result) ? result : [];
        return tags;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch tags:", error);
        return [];
      }
    },
    ...QUERY_CONFIG.LONG,
  });
}

/** Hook to create a new tag. */
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => marketplaceService.createTag(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.tags() });
      showSuccessToast("Tag created successfully!");
    },
    onError: onMutationError("Failed to create tag"),
  });
}

/** Hook to delete a tag. */
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => marketplaceService.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.tags() });
      showSuccessToast("Tag deleted successfully!");
    },
    onError: onMutationError("Failed to delete tag"),
  });
}

/**
 * Combined hook for marketplace management.
 * Provides all marketplace CRUD operations in a single hook.
 */
export function useMarketplaceManager() {
  const createItem = useCreateMarketplaceItem();
  const updateItem = useUpdateMarketplaceItem();
  const deleteItem = useDeleteMarketplaceItem();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();

  return {
    createItem,
    updateItem,
    deleteItem,
    createCategory,
    deleteCategory,
    createTag,
    deleteTag,
  };
}
