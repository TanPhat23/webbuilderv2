import { URLBuilder } from "@/utils/urlbuilder";
import apiClient from "@/services/apiclient";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";
import type {
  ContentField,
  ContentItem,
  ContentItemWriteInput,
  ContentType,
  PublicContentQuery,
} from "../interfaces/cms.interface";

type ContentTypeListResponse = ContentType[] | { data?: ContentType[] };

type ContentFieldListResponse = ContentField[] | { data?: ContentField[] };
type ContentItemListResponse = ContentItem[] | { data?: ContentItem[] };

function normalizeListResponse<T>(response: T[] | { data?: T[] }): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.data) ? response.data : [];
}

export const cmsService = {
  getContentTypes: async (token: string): Promise<ContentType[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.CMS.CONTENT_TYPES.GET)
      .build();

    const response = await apiClient.get<ContentTypeListResponse>(
      url,
      undefined,
      token,
    );

    return normalizeListResponse(response);
  },

  createContentType: (
    data: Partial<ContentType>,
    token: string,
  ): Promise<ContentType> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.CMS.CONTENT_TYPES.CREATE)
      .build();

    return apiClient.post<ContentType>(url, data, undefined, token);
  },

  getContentTypeById: (id: string, token: string): Promise<ContentType> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.CMS.CONTENT_TYPES.GET_BY_ID(id))
      .build();

    return apiClient.get<ContentType>(url, undefined, token);
  },

  updateContentType: (
    id: string,
    data: Partial<ContentType>,
    token: string,
  ): Promise<ContentType> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.CMS.CONTENT_TYPES.UPDATE(id))
      .build();

    return apiClient.patch<ContentType>(url, data, undefined, token);
  },

  deleteContentType: (id: string, token: string): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.CMS.CONTENT_TYPES.DELETE(id))
      .build();

    return apiClient.delete(url, undefined, token);
  },

  getContentFieldsByContentType: async (
    contentTypeId: string,
    token: string,
  ): Promise<ContentField[]> => {
    const url = new URLBuilder("api")
      .setPath(
        API_ENDPOINTS.CMS.CONTENT_FIELDS.GET_BY_CONTENT_TYPE(contentTypeId),
      )
      .build();

    const response = await apiClient.get<ContentFieldListResponse>(
      url,
      undefined,
      token,
    );

    return normalizeListResponse(response);
  },

  createContentField: (
    contentTypeId: string,
    data: Partial<ContentField>,
    token: string,
  ): Promise<ContentField> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.CMS.CONTENT_FIELDS.CREATE(contentTypeId))
      .build();

    return apiClient.post<ContentField>(url, data, undefined, token);
  },

  getContentFieldById: (
    contentTypeId: string,
    fieldId: string,
    token: string,
  ): Promise<ContentField> => {
    const url = new URLBuilder("api")
      .setPath(
        API_ENDPOINTS.CMS.CONTENT_FIELDS.GET_BY_ID(contentTypeId, fieldId),
      )
      .build();

    return apiClient.get<ContentField>(url, undefined, token);
  },

  updateContentField: (
    contentTypeId: string,
    fieldId: string,
    data: Partial<ContentField>,
    token: string,
  ): Promise<ContentField> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.CMS.CONTENT_FIELDS.UPDATE(contentTypeId, fieldId))
      .build();

    return apiClient.patch<ContentField>(url, data, undefined, token);
  },

  deleteContentField: (
    contentTypeId: string,
    fieldId: string,
    token: string,
  ): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.CMS.CONTENT_FIELDS.DELETE(contentTypeId, fieldId))
      .build();

    return apiClient.delete(url, undefined, token);
  },

  getContentItemsByContentType: async (
    contentTypeId: string,
    token: string,
  ): Promise<ContentItem[]> => {
    const url = new URLBuilder("api")
      .setPath(
        API_ENDPOINTS.CMS.CONTENT_ITEMS.GET_BY_CONTENT_TYPE(contentTypeId),
      )
      .build();

    const response = await apiClient.get<ContentItemListResponse>(
      url,
      undefined,
      token,
    );

    return normalizeListResponse(response);
  },

  createContentItem: (
    contentTypeId: string,
    data: ContentItemWriteInput,
    token: string,
  ): Promise<ContentItem> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.CMS.CONTENT_ITEMS.CREATE(contentTypeId))
      .build();

    return apiClient.post<ContentItem>(url, data, undefined, token);
  },

  getContentItemById: (
    contentTypeId: string,
    itemId: string,
    token: string,
  ): Promise<ContentItem> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.CMS.CONTENT_ITEMS.GET_BY_ID(contentTypeId, itemId))
      .build();

    return apiClient.get<ContentItem>(url, undefined, token);
  },

  updateContentItem: (
    contentTypeId: string,
    itemId: string,
    data: ContentItemWriteInput,
    token: string,
  ): Promise<ContentItem> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.CMS.CONTENT_ITEMS.UPDATE(contentTypeId, itemId))
      .build();

    return apiClient.patch<ContentItem, ContentItemWriteInput>(
      url,
      data,
      undefined,
      token,
    );
  },

  deleteContentItem: (
    contentTypeId: string,
    itemId: string,
    token: string,
  ): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.CMS.CONTENT_ITEMS.DELETE(contentTypeId, itemId))
      .build();

    return apiClient.delete(url, undefined, token);
  },

  getPublicContent: async (
    params: PublicContentQuery | undefined,
    token: string,
  ): Promise<ContentItem[]> => {
    if (!params?.contentTypeId) {
      return [];
    }

    const url = new URLBuilder("api")
      .setPath(
        API_ENDPOINTS.CMS.CONTENT_ITEMS.GET_BY_CONTENT_TYPE(
          params.contentTypeId,
        ),
      )
      .build();

    const response = await apiClient.get<ContentItemListResponse>(
      url,
      undefined,
      token,
    );

    const items = normalizeListResponse(response);
    const sortBy = params.sortBy ?? "createdAt";
    const sortOrder = params.sortOrder ?? "desc";

    const sortedItems = [...items].sort((left, right) => {
      const leftValue = (left as unknown as Record<string, unknown>)[sortBy];
      const rightValue = (right as unknown as Record<string, unknown>)[sortBy];

      if (leftValue == null && rightValue == null) {
        return 0;
      }

      if (leftValue == null) {
        return 1;
      }

      if (rightValue == null) {
        return -1;
      }

      const comparison = String(leftValue).localeCompare(String(rightValue));
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return params.limit ? sortedItems.slice(0, params.limit) : sortedItems;
  },

  getPublicContentItem: async (
    contentTypeId: string,
    slug: string,
    token: string,
  ): Promise<ContentItem> => {
    const url = new URLBuilder("api")
      .setPath(
        API_ENDPOINTS.CMS.CONTENT_ITEMS.GET_BY_CONTENT_TYPE(contentTypeId),
      )
      .build();

    const response = await apiClient.get<ContentItemListResponse>(
      url,
      undefined,
      token,
    );

    const items = normalizeListResponse(response);
    const item = items.find((entry) => entry.slug === slug);

    if (!item) {
      throw new Error(`Content item with slug "${slug}" not found`);
    }

    return item;
  },
};
