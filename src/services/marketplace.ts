import { URLBuilder } from "@/lib/utils/urlbuilder";
import {
  MarketplaceItem,
  CreateMarketplaceItemRequest,
  UpdateMarketplaceItemRequest,
  MarketplaceItemWithRelations,
  MarketplaceFilters,
  Category,
  Tag,
} from "@/interfaces/market.interface";
import { Project } from "@/interfaces/project.interface";
import apiClient from "./apiclient";
import { API_ENDPOINTS } from "@/constants/endpoints";

interface IMarketplaceService {
  // Marketplace Items
  createMarketplaceItem: (
    data: CreateMarketplaceItemRequest,
  ) => Promise<MarketplaceItem>;
  getMarketplaceItems: (
    filters?: MarketplaceFilters,
  ) => Promise<MarketplaceItemWithRelations[]>;
  getMarketplaceItemByID: (id: string) => Promise<MarketplaceItemWithRelations>;
  updateMarketplaceItem: (
    id: string,
    data: UpdateMarketplaceItemRequest,
  ) => Promise<MarketplaceItem>;
  deleteMarketplaceItem: (id: string) => Promise<boolean>;
  downloadMarketplaceItem: (id: string) => Promise<Project>;
  incrementDownloads: (id: string) => Promise<boolean>;
  incrementLikes: (id: string) => Promise<boolean>;

  // Categories
  createCategory: (name: string) => Promise<Category>;
  getCategories: () => Promise<Category[]>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Tags
  createTag: (name: string) => Promise<Tag>;
  getTags: () => Promise<Tag[]>;
  deleteTag: (id: string) => Promise<boolean>;
}

export const marketplaceService: IMarketplaceService = {
  createMarketplaceItem: async (
    data: CreateMarketplaceItemRequest,
  ): Promise<MarketplaceItem> => {
    return apiClient.post<MarketplaceItem>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.ITEMS.CREATE)
        .build(),
      data,
    );
  },

  getMarketplaceItems: async (
    filters?: MarketplaceFilters,
  ): Promise<MarketplaceItemWithRelations[]> => {
    const builder = new URLBuilder("api").setPath(
      API_ENDPOINTS.MARKETPLACE.ITEMS.GET_ALL,
    );
    if (filters) {
      if (filters.templateType)
        builder.addQueryParam("templateType", filters.templateType);
      if (filters.featured !== undefined)
        builder.addQueryParam("featured", String(filters.featured));
      if (filters.categoryId)
        builder.addQueryParam("categoryId", filters.categoryId);
      if (filters.tags && filters.tags.length > 0)
        builder.addQueryParam("tags", filters.tags.join(","));
      if (filters.search) builder.addQueryParam("search", filters.search);
      if (filters.authorId) builder.addQueryParam("authorId", filters.authorId);
    }

    const response = await apiClient.get<any>(builder.build());

    // Handle potential response wrapping
    // Backend might return { data: [...] } or just [...]
    if (response && typeof response === "object") {
      if (Array.isArray(response)) {
        return response;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.items && Array.isArray(response.items)) {
        return response.items;
      }
    }

    // Fallback to empty array if structure is unexpected
    console.warn("Unexpected marketplace items response structure:", response);
    return [];
  },

  getMarketplaceItemByID: async (
    id: string,
  ): Promise<MarketplaceItemWithRelations> => {
    return apiClient.get<MarketplaceItemWithRelations>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.ITEMS.GET_BY_ID(id))
        .build(),
    );
  },

  updateMarketplaceItem: async (
    id: string,
    data: UpdateMarketplaceItemRequest,
  ): Promise<MarketplaceItem> => {
    return apiClient.patch<MarketplaceItem>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.ITEMS.UPDATE(id))
        .build(),
      data,
    );
  },

  deleteMarketplaceItem: async (id: string): Promise<boolean> => {
    return apiClient.delete(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.ITEMS.DELETE(id))
        .build(),
    );
  },

  incrementDownloads: async (id: string): Promise<boolean> => {
    return apiClient.post<boolean>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.ITEMS.INCREMENT_DOWNLOADS(id))
        .build(),
      {},
    );
  },

  incrementLikes: async (id: string): Promise<boolean> => {
    return apiClient.post<boolean>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.ITEMS.INCREMENT_LIKES(id))
        .build(),
      {},
    );
  },

  createCategory: async (name: string): Promise<Category> => {
    return apiClient.post<Category>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.CATEGORIES.CREATE)
        .build(),
      { name },
    );
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<any>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.CATEGORIES.GET_ALL)
        .build(),
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

  deleteCategory: async (id: string): Promise<boolean> => {
    return apiClient.delete(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.CATEGORIES.DELETE(id))
        .build(),
    );
  },

  createTag: async (name: string): Promise<Tag> => {
    return apiClient.post<Tag>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.TAGS.CREATE)
        .build(),
      {
        name,
      },
    );
  },

  getTags: async (): Promise<Tag[]> => {
    const response = await apiClient.get<any>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.TAGS.GET_ALL)
        .build(),
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

  deleteTag: async (id: string): Promise<boolean> => {
    return apiClient.delete(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.TAGS.DELETE(id))
        .build(),
    );
  },

  downloadMarketplaceItem: async (
    marketplaceItemId: string,
  ): Promise<Project> => {
    const response = await apiClient.post<{ project: Project }>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.MARKETPLACE.ITEMS.DOWNLOAD(marketplaceItemId))
        .build(),
      {},
    );
    return response.project;
  },
};
