import { URLBuilder } from "@/lib/utils/urlbuilder";
import apiClient from "./apiclient";
import { API_ENDPOINTS } from "@/constants/endpoints";
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

  // Public Content
  getPublicContent: async (params?: {
    contentTypeId?: string;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ContentItem[]> => {
    const builder = new URLBuilder("api").setPath(
      API_ENDPOINTS.CMS.PUBLIC_CONTENT.GET,
    );
    if (params?.contentTypeId)
      builder.addQueryParam("contentTypeId", params.contentTypeId);
    if (params?.limit) builder.addQueryParam("limit", params.limit.toString());
    if (params?.sortBy) builder.addQueryParam("sortBy", params.sortBy);
    if (params?.sortOrder) builder.addQueryParam("sortOrder", params.sortOrder);
    return apiClient.get(builder.build());
  },

  getPublicContentItem: async (
    contentTypeId: string,
    slug: string,
  ): Promise<ContentItem> => {
    return apiClient.get(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.CMS.PUBLIC_CONTENT.GET_ITEM(contentTypeId, slug))
        .build(),
    );
  },
};
