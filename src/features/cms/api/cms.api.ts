import { createServerFn } from "@tanstack/react-start";
import z from "zod";

import { cmsService } from "@/features/cms/services/cms.service";
import type {
  ContentField,
  ContentFieldValueInput,
  ContentItem,
  ContentItemWriteInput,
  ContentType,
  PublicContentQuery,
} from "@/features/cms/interfaces/cms.interface";
import {
  ContentFieldFormSchema,
  ContentItemFormSchema,
  ContentTypeFormSchema,
} from "@/features/cms/schema/cms";
import { getAuthToken } from "@/features/auth/lib/gettoken";

const ContentTypeIdSchema = z.object({
  contentTypeId: z.string().min(1, "Content type ID is required"),
});

const ContentTypeRecordIdSchema = z.object({
  id: z.string().min(1, "Content type ID is required"),
});

const ContentTypeFieldIdSchema = z.object({
  contentTypeId: z.string().min(1, "Content type ID is required"),
  fieldId: z.string().min(1, "Field ID is required"),
});

const ContentTypeItemIdSchema = z.object({
  contentTypeId: z.string().min(1, "Content type ID is required"),
  itemId: z.string().min(1, "Item ID is required"),
});

const PublicContentQuerySchema = z.object({
  contentTypeId: z.string().min(1, "Content type ID is required").optional(),
  limit: z.number().int().positive().optional(),
  sortBy: z.enum(["title", "createdAt", "updatedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

const PublicContentItemRequestSchema = z.object({
  contentTypeId: z.string().min(1, "Content type ID is required"),
  slug: z.string().min(1, "Slug is required"),
});

const ContentFieldValueInputSchema = z.object({
  fieldId: z.string().min(1, "Field ID is required"),
  value: z.string(),
});

const ContentItemMutationSchema = ContentItemFormSchema.extend({
  fieldValues: z.array(ContentFieldValueInputSchema).optional(),
});

const CreateContentTypeRequestSchema = ContentTypeFormSchema;

const UpdateContentTypeRequestSchema = z.object({
  id: z.string().min(1, "Content type ID is required"),
  data: ContentTypeFormSchema.partial(),
});

const CreateContentFieldRequestSchema = z.object({
  contentTypeId: z.string().min(1, "Content type ID is required"),
  data: ContentFieldFormSchema,
});

const UpdateContentFieldRequestSchema = z.object({
  contentTypeId: z.string().min(1, "Content type ID is required"),
  fieldId: z.string().min(1, "Field ID is required"),
  data: ContentFieldFormSchema.partial(),
});

const CreateContentItemRequestSchema = z.object({
  contentTypeId: z.string().min(1, "Content type ID is required"),
  data: ContentItemMutationSchema,
});

const UpdateContentItemRequestSchema = z.object({
  contentTypeId: z.string().min(1, "Content type ID is required"),
  itemId: z.string().min(1, "Item ID is required"),
  data: ContentItemMutationSchema.partial(),
});

type ContentTypeIdInput = z.infer<typeof ContentTypeIdSchema>;
type ContentTypeRecordIdInput = z.infer<typeof ContentTypeRecordIdSchema>;
type ContentTypeFieldIdInput = z.infer<typeof ContentTypeFieldIdSchema>;
type ContentTypeItemIdInput = z.infer<typeof ContentTypeItemIdSchema>;
type PublicContentQueryInput = z.infer<typeof PublicContentQuerySchema>;
type PublicContentItemRequest = z.infer<typeof PublicContentItemRequestSchema>;
type CreateContentTypeRequest = z.infer<typeof CreateContentTypeRequestSchema>;
type UpdateContentTypeRequest = z.infer<typeof UpdateContentTypeRequestSchema>;
type CreateContentFieldRequest = z.infer<
  typeof CreateContentFieldRequestSchema
>;
type UpdateContentFieldRequest = z.infer<
  typeof UpdateContentFieldRequestSchema
>;
type CreateContentItemRequest = z.infer<typeof CreateContentItemRequestSchema>;
type UpdateContentItemRequest = z.infer<typeof UpdateContentItemRequestSchema>;

function normalizeFieldValues(
  fieldValues?: ContentFieldValueInput[],
): ContentFieldValueInput[] | undefined {
  return fieldValues?.map((fieldValue) => ({
    fieldId: fieldValue.fieldId,
    value: fieldValue.value,
  }));
}

export const getContentTypes = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContentType[]> => {
    const { token } = await getAuthToken();
    return cmsService.getContentTypes(token);
  },
);

export const getContentTypeById = createServerFn({ method: "GET" })
  .inputValidator((data: ContentTypeRecordIdInput) =>
    ContentTypeRecordIdSchema.parse(data),
  )
  .handler(async ({ data }): Promise<ContentType> => {
    const { token } = await getAuthToken();
    return cmsService.getContentTypeById(data.id, token);
  });

export const createContentType = createServerFn({ method: "POST" })
  .inputValidator((data: CreateContentTypeRequest) =>
    CreateContentTypeRequestSchema.parse(data),
  )
  .handler(async ({ data }): Promise<ContentType> => {
    const { token } = await getAuthToken();
    return cmsService.createContentType(data, token);
  });

export const updateContentType = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateContentTypeRequest) =>
    UpdateContentTypeRequestSchema.parse(data),
  )
  .handler(async ({ data }): Promise<ContentType> => {
    const { token } = await getAuthToken();
    return cmsService.updateContentType(data.id, data.data, token);
  });

export const deleteContentType = createServerFn({ method: "POST" })
  .inputValidator((data: ContentTypeRecordIdInput) =>
    ContentTypeRecordIdSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    await cmsService.deleteContentType(data.id, token);
    return { success: true };
  });

export const getContentFieldsByContentType = createServerFn({ method: "GET" })
  .inputValidator((data: ContentTypeIdInput) => ContentTypeIdSchema.parse(data))
  .handler(async ({ data }): Promise<ContentField[]> => {
    const { token } = await getAuthToken();
    return cmsService.getContentFieldsByContentType(data.contentTypeId, token);
  });

export const getContentFieldById = createServerFn({ method: "GET" })
  .inputValidator((data: ContentTypeFieldIdInput) =>
    ContentTypeFieldIdSchema.parse(data),
  )
  .handler(async ({ data }): Promise<ContentField> => {
    const { token } = await getAuthToken();
    return cmsService.getContentFieldById(
      data.contentTypeId,
      data.fieldId,
      token,
    );
  });

export const createContentField = createServerFn({ method: "POST" })
  .inputValidator((data: CreateContentFieldRequest) =>
    CreateContentFieldRequestSchema.parse(data),
  )
  .handler(async ({ data }): Promise<ContentField> => {
    const { token } = await getAuthToken();
    return cmsService.createContentField(data.contentTypeId, data.data, token);
  });

export const updateContentField = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateContentFieldRequest) =>
    UpdateContentFieldRequestSchema.parse(data),
  )
  .handler(async ({ data }): Promise<ContentField> => {
    const { token } = await getAuthToken();
    return cmsService.updateContentField(
      data.contentTypeId,
      data.fieldId,
      data.data,
      token,
    );
  });

export const deleteContentField = createServerFn({ method: "POST" })
  .inputValidator((data: ContentTypeFieldIdInput) =>
    ContentTypeFieldIdSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    await cmsService.deleteContentField(
      data.contentTypeId,
      data.fieldId,
      token,
    );
    return { success: true };
  });

export const getContentItemsByContentType = createServerFn({ method: "GET" })
  .inputValidator((data: ContentTypeIdInput) => ContentTypeIdSchema.parse(data))
  .handler(async ({ data }): Promise<ContentItem[]> => {
    const { token } = await getAuthToken();
    return cmsService.getContentItemsByContentType(data.contentTypeId, token);
  });

export const getContentItemById = createServerFn({ method: "GET" })
  .inputValidator((data: ContentTypeItemIdInput) =>
    ContentTypeItemIdSchema.parse(data),
  )
  .handler(async ({ data }): Promise<ContentItem> => {
    const { token } = await getAuthToken();
    return cmsService.getContentItemById(
      data.contentTypeId,
      data.itemId,
      token,
    );
  });

export const createContentItem = createServerFn({ method: "POST" })
  .inputValidator((data: CreateContentItemRequest) =>
    CreateContentItemRequestSchema.parse(data),
  )
  .handler(async ({ data }): Promise<ContentItem> => {
    const { token } = await getAuthToken();

    const input: ContentItemWriteInput = {
      ...data.data,
      fieldValues: normalizeFieldValues(data.data.fieldValues),
    };

    return cmsService.createContentItem(data.contentTypeId, input, token);
  });

export const updateContentItem = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateContentItemRequest) =>
    UpdateContentItemRequestSchema.parse(data),
  )
  .handler(async ({ data }): Promise<ContentItem> => {
    const { token } = await getAuthToken();

    const input: ContentItemWriteInput = {
      ...data.data,
      fieldValues: normalizeFieldValues(data.data.fieldValues),
    };

    return cmsService.updateContentItem(
      data.contentTypeId,
      data.itemId,
      input,
      token,
    );
  });

export const deleteContentItem = createServerFn({ method: "POST" })
  .inputValidator((data: ContentTypeItemIdInput) =>
    ContentTypeItemIdSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    await cmsService.deleteContentItem(data.contentTypeId, data.itemId, token);
    return { success: true };
  });

export const getPublicContent = createServerFn({ method: "GET" })
  .inputValidator((data: PublicContentQueryInput) =>
    PublicContentQuerySchema.parse(data),
  )
  .handler(async ({ data }): Promise<ContentItem[]> => {
    const { token } = await getAuthToken();

    const query: PublicContentQuery = {
      contentTypeId: data.contentTypeId,
      limit: data.limit,
      sortBy: data.sortBy,
      sortOrder: data.sortOrder,
    };

    return cmsService.getPublicContent(query, token);
  });

export const getPublicContentItem = createServerFn({ method: "GET" })
  .inputValidator((data: PublicContentItemRequest) =>
    PublicContentItemRequestSchema.parse(data),
  )
  .handler(async ({ data }): Promise<ContentItem> => {
    const { token } = await getAuthToken();
    return cmsService.getPublicContentItem(
      data.contentTypeId,
      data.slug,
      token,
    );
  });
