import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { a as apiClient, U as URLBuilder, A as API_ENDPOINTS } from "./project.service-Bci2lGYe.js";
import { Q as QUERY_CONFIG, O as onMutationError, a9 as showSuccessToast } from "./prisma-BUnO9f9X.js";
const marketplaceService = {
  createMarketplaceItem: async (data) => {
    return apiClient.post(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.ITEMS.CREATE).build(),
      data
    );
  },
  getMarketplaceItems: async (filters) => {
    const builder = new URLBuilder("api").setPath(
      API_ENDPOINTS.MARKETPLACE.ITEMS.GET_ALL
    );
    if (filters) {
      if (filters.templateType)
        builder.addQueryParam("templateType", filters.templateType);
      if (filters.featured !== void 0)
        builder.addQueryParam("featured", String(filters.featured));
      if (filters.categoryId)
        builder.addQueryParam("categoryId", filters.categoryId);
      if (filters.tags && filters.tags.length > 0)
        builder.addQueryParam("tags", filters.tags.join(","));
      if (filters.search) builder.addQueryParam("search", filters.search);
      if (filters.authorId) builder.addQueryParam("authorId", filters.authorId);
    }
    const response = await apiClient.get(builder.build());
    if (response && typeof response === "object") {
      if (Array.isArray(response)) {
        return response;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.items && Array.isArray(response.items)) {
        return response.items;
      }
    }
    console.warn("Unexpected marketplace items response structure:", response);
    return [];
  },
  getMarketplaceItemByID: async (id) => {
    return apiClient.get(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.ITEMS.GET_BY_ID(id)).build()
    );
  },
  updateMarketplaceItem: async (id, data) => {
    return apiClient.patch(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.ITEMS.UPDATE(id)).build(),
      data
    );
  },
  deleteMarketplaceItem: async (id) => {
    return apiClient.delete(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.ITEMS.DELETE(id)).build()
    );
  },
  incrementDownloads: async (id) => {
    return apiClient.post(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.ITEMS.INCREMENT_DOWNLOADS(id)).build(),
      {}
    );
  },
  incrementLikes: async (id) => {
    return apiClient.post(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.ITEMS.INCREMENT_LIKES(id)).build(),
      {}
    );
  },
  createCategory: async (name) => {
    return apiClient.post(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.CATEGORIES.CREATE).build(),
      { name }
    );
  },
  getCategories: async () => {
    const response = await apiClient.get(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.CATEGORIES.GET_ALL).build()
    );
    if (response && typeof response === "object") {
      if (Array.isArray(response)) {
        return response;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.categories && Array.isArray(response.categories)) {
        return response.categories;
      }
    }
    return [];
  },
  deleteCategory: async (id) => {
    return apiClient.delete(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.CATEGORIES.DELETE(id)).build()
    );
  },
  createTag: async (name) => {
    return apiClient.post(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.TAGS.CREATE).build(),
      {
        name
      }
    );
  },
  getTags: async () => {
    const response = await apiClient.get(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.TAGS.GET_ALL).build()
    );
    if (response && typeof response === "object") {
      if (Array.isArray(response)) {
        return response;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.tags && Array.isArray(response.tags)) {
        return response.tags;
      }
    }
    return [];
  },
  deleteTag: async (id) => {
    return apiClient.delete(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.TAGS.DELETE(id)).build()
    );
  },
  downloadMarketplaceItem: async (marketplaceItemId) => {
    const response = await apiClient.post(
      new URLBuilder("api").setPath(API_ENDPOINTS.MARKETPLACE.ITEMS.DOWNLOAD(marketplaceItemId)).build(),
      {}
    );
    return response.project;
  }
};
const marketplaceKeys = {
  all: ["marketplace"],
  items: () => [...marketplaceKeys.all, "items"],
  itemsList: (filters) => [...marketplaceKeys.items(), { filters }],
  item: (id) => [...marketplaceKeys.items(), id],
  categories: () => [...marketplaceKeys.all, "categories"],
  tags: () => [...marketplaceKeys.all, "tags"]
};
function useMarketplaceItems(filters) {
  return useQuery({
    queryKey: marketplaceKeys.itemsList(filters),
    queryFn: async () => {
      try {
        const result = await marketplaceService.getMarketplaceItems(filters);
        const items = Array.isArray(result) ? result : [];
        return items;
      } catch (error) {
        console.error("Failed to fetch marketplace items:", error);
        return [];
      }
    },
    ...QUERY_CONFIG.DEFAULT
  });
}
function useMarketplaceItem(id, enabled = true) {
  return useQuery({
    queryKey: marketplaceKeys.item(id),
    queryFn: async () => {
      try {
        return await marketplaceService.getMarketplaceItemByID(id);
      } catch (error) {
        if (error instanceof Error && !error.message.includes("404")) {
          console.error("Failed to fetch marketplace item:", error);
        }
        throw error;
      }
    },
    enabled: enabled && !!id,
    ...QUERY_CONFIG.DEFAULT,
    retry: false
    // Don't retry on 404 errors
  });
}
function useCreateMarketplaceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => marketplaceService.createMarketplaceItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.items() });
      showSuccessToast("Template created successfully!");
    },
    onError: onMutationError("Failed to create template")
  });
}
function useUpdateMarketplaceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data
    }) => marketplaceService.updateMarketplaceItem(id, data),
    onSuccess: (updatedItem, variables) => {
      queryClient.setQueryData(marketplaceKeys.item(variables.id), updatedItem);
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.items() });
      showSuccessToast("Template updated successfully!");
    },
    onError: onMutationError("Failed to update template")
  });
}
function useDeleteMarketplaceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => marketplaceService.deleteMarketplaceItem(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: marketplaceKeys.item(id) });
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.items() });
      queryClient.invalidateQueries({ queryKey: ["marketplaceItems"] });
      showSuccessToast("Template deleted successfully!");
    },
    onError: onMutationError("Failed to delete template")
  });
}
function useDownloadMarketplaceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (marketplaceItemId) => {
      const newProject = await marketplaceService.downloadMarketplaceItem(marketplaceItemId);
      return newProject;
    },
    onSuccess: (newProject, marketplaceItemId) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.setQueryData(
        marketplaceKeys.item(marketplaceItemId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            downloads: (old.downloads || 0) + 1
          };
        }
      );
      showSuccessToast(
        `Template downloaded! Created project: ${newProject.name}`
      );
    },
    onError: onMutationError("Failed to download template")
  });
}
function useIncrementLikes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => marketplaceService.incrementLikes(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        marketplaceKeys.item(id),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            likes: (old.likes || 0) + 1
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.item(id) });
      showSuccessToast("Thanks for liking this template!");
    },
    onError: onMutationError("Failed to like template")
  });
}
function useCategories() {
  return useQuery({
    queryKey: marketplaceKeys.categories(),
    queryFn: async () => {
      try {
        const result = await marketplaceService.getCategories();
        const cats = Array.isArray(result) ? result : [];
        return cats;
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
      }
    },
    ...QUERY_CONFIG.LONG
  });
}
function useTags() {
  return useQuery({
    queryKey: marketplaceKeys.tags(),
    queryFn: async () => {
      try {
        const result = await marketplaceService.getTags();
        const tags = Array.isArray(result) ? result : [];
        return tags;
      } catch (error) {
        console.error("Failed to fetch tags:", error);
        return [];
      }
    },
    ...QUERY_CONFIG.LONG
  });
}
export {
  useDownloadMarketplaceItem as a,
  useIncrementLikes as b,
  useCategories as c,
  useCreateMarketplaceItem as d,
  useUpdateMarketplaceItem as e,
  useMarketplaceItem as f,
  useTags as g,
  useDeleteMarketplaceItem as h,
  useMarketplaceItems as u
};
