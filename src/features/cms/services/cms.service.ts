import { URLBuilder } from "@/utils/urlbuilder";
import apiClient from "@/services/apiclient";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";
import {
  ContentType,
  ContentField,
  ContentFieldValue,
  ContentItem,
} from "../interfaces/cms.interface";

interface ICmsService<TContext = any> {
  getContentTypes(): Promise<ContentType[]>;
  createContentType(data: Partial<ContentType>): Promise<ContentType>;
  getContentTypeById(id: string): Promise<ContentType>;
  updateContentType(
    id: string,
    data: Partial<ContentType>,
  ): Promise<ContentType>;
  deleteContentType(id: string): Promise<boolean>;
  getContentFieldsByContentType(contentTypeId: string): Promise<ContentField[]>;
  createContentField(
    contentTypeId: string,
    data: Partial<ContentField>,
  ): Promise<ContentField>;
  getContentFieldById(
    contentTypeId: string,
    fieldId: string,
  ): Promise<ContentField>;
  updateContentField(
    contentTypeId: string,
    fieldId: string,
    data: Partial<ContentField>,
  ): Promise<ContentField>;
  deleteContentField(contentTypeId: string, fieldId: string): Promise<boolean>;
  getContentItemsByContentType(contentTypeId: string): Promise<ContentItem[]>;
  createContentItem(
    contentTypeId: string,
    data: Partial<ContentItem>,
  ): Promise<ContentItem>;
  getContentItemById(
    contentTypeId: string,
    itemId: string,
  ): Promise<ContentItem>;
  updateContentItem(
    contentTypeId: string,
    itemId: string,
    data: Partial<ContentItem>,
  ): Promise<ContentItem>;
  deleteContentItem(contentTypeId: string, itemId: string): Promise<boolean>;
  getPublicContent(params?: {
    contentTypeId?: string;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<any>;
  getPublicContentItem(
    contentTypeId: string,
    slug: string,
  ): Promise<ContentItem>;
}

export const cmsService: ICmsService = {
  getContentTypes: async (): Promise<ContentType[]> => {
    return apiClient.get(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.CMS.CONTENT_TYPES.GET)
        .build(),
    );
  },

  createContentType: async (
    data: Partial<ContentType>,
  ): Promise<ContentType> => {
    return apiClient.post(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.CMS.CONTENT_TYPES.CREATE)
        .build(),
      data,
    );
  },

  getContentTypeById: async (id: string): Promise<ContentType> => {
    return apiClient.get(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.CMS.CONTENT_TYPES.GET_BY_ID(id))
        .build(),
    );
  },

  updateContentType: async (
    id: string,
    data: Partial<ContentType>,
  ): Promise<ContentType> => {
    return apiClient.patch(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.CMS.CONTENT_TYPES.UPDATE(id))
        .build(),
      data,
    );
  },

  deleteContentType: async (id: string): Promise<boolean> => {
    return apiClient.delete(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.CMS.CONTENT_TYPES.DELETE(id))
        .build(),
    );
  },

  // Content Fields
  getContentFieldsByContentType: async (
    contentTypeId: string,
  ): Promise<ContentField[]> => {
    return apiClient.get(
      new URLBuilder("api")
        .setPath(
          API_ENDPOINTS.CMS.CONTENT_FIELDS.GET_BY_CONTENT_TYPE(contentTypeId),
        )
        .build(),
    );
  },

  createContentField: async (
    contentTypeId: string,
    data: Partial<ContentField>,
  ): Promise<ContentField> => {
    return apiClient.post(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.CMS.CONTENT_FIELDS.CREATE(contentTypeId))
        .build(),
      data,
    );
  },

  getContentFieldById: async (
    contentTypeId: string,
    fieldId: string,
  ): Promise<ContentField> => {
    return apiClient.get(
      new URLBuilder("api")
        .setPath(
          API_ENDPOINTS.CMS.CONTENT_FIELDS.GET_BY_ID(contentTypeId, fieldId),
        )
        .build(),
    );
  },

  updateContentField: async (
    contentTypeId: string,
    fieldId: string,
    data: Partial<ContentField>,
  ): Promise<ContentField> => {
    return apiClient.patch(
      new URLBuilder("api")
        .setPath(
          API_ENDPOINTS.CMS.CONTENT_FIELDS.UPDATE(contentTypeId, fieldId),
        )
        .build(),
      data,
    );
  },

  deleteContentField: async (
    contentTypeId: string,
    fieldId: string,
  ): Promise<boolean> => {
    return apiClient.delete(
      new URLBuilder("api")
        .setPath(
          API_ENDPOINTS.CMS.CONTENT_FIELDS.DELETE(contentTypeId, fieldId),
        )
        .build(),
    );
  },

  // Content Items
  getContentItemsByContentType: async (
    contentTypeId: string,
  ): Promise<ContentItem[]> => {
    return apiClient.get(
      new URLBuilder("api")
        .setPath(
          API_ENDPOINTS.CMS.CONTENT_ITEMS.GET_BY_CONTENT_TYPE(contentTypeId),
        )
        .build(),
    );
  },

  createContentItem: async (
    contentTypeId: string,
    data: Partial<ContentItem>,
  ): Promise<ContentItem> => {
    return apiClient.post(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.CMS.CONTENT_ITEMS.CREATE(contentTypeId))
        .build(),
      data,
    );
  },

  getContentItemById: async (
    contentTypeId: string,
    itemId: string,
  ): Promise<ContentItem> => {
    return apiClient.get(
      new URLBuilder("api")
        .setPath(
          API_ENDPOINTS.CMS.CONTENT_ITEMS.GET_BY_ID(contentTypeId, itemId),
        )
        .build(),
    );
  },

  updateContentItem: async (
    contentTypeId: string,
    itemId: string,
    data: Partial<ContentItem>,
  ): Promise<ContentItem> => {
    return apiClient.patch(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.CMS.CONTENT_ITEMS.UPDATE(contentTypeId, itemId))
        .build(),
      data,
    );
  },

  deleteContentItem: async (
    contentTypeId: string,
    itemId: string,
  ): Promise<boolean> => {
    return apiClient.delete(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.CMS.CONTENT_ITEMS.DELETE(contentTypeId, itemId))
        .build(),
    );
  },

  // Public Content — reuses the existing items endpoint with client-side sort/limit
  getPublicContent: async (params?: {
    contentTypeId?: string;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ContentItem[]> => {
    if (!params?.contentTypeId) return [];

    const items: ContentItem[] = await apiClient.get(
      new URLBuilder("api")
        .setPath(
          API_ENDPOINTS.CMS.CONTENT_ITEMS.GET_BY_CONTENT_TYPE(
            params.contentTypeId,
          ),
        )
        .build(),
    );

    const sortBy = params.sortBy ?? "createdAt";
    const sortOrder = params.sortOrder ?? "desc";

    const sorted = [...items].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortBy];
      const bVal = (b as unknown as Record<string, unknown>)[sortBy];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return params.limit ? sorted.slice(0, params.limit) : sorted;
  },

  getPublicContentItem: async (
    contentTypeId: string,
    slug: string,
  ): Promise<ContentItem> => {
    const items: ContentItem[] = await apiClient.get(
      new URLBuilder("api")
        .setPath(
          API_ENDPOINTS.CMS.CONTENT_ITEMS.GET_BY_CONTENT_TYPE(contentTypeId),
        )
        .build(),
    );
    const item = items.find((i) => i.slug === slug);
    if (!item) throw new Error(`Content item with slug "${slug}" not found`);
    return item;
  },
};
