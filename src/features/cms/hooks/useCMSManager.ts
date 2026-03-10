import { useCallback, useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  createContentField,
  createContentItem,
  createContentType,
  deleteContentField,
  deleteContentItem,
  deleteContentType,
  getContentFieldsByContentType,
  getContentItemsByContentType,
  getContentTypes,
  updateContentField,
  updateContentItem,
  updateContentType,
} from "@/features/cms";
import type {
  ContentField,
  ContentFieldValueInput,
  ContentItem,
  ContentType,
} from "@/features/cms";
import {
  ContentFieldFormSchema,
  ContentItemFormSchema,
  ContentTypeFormSchema,
} from "@/features/cms/schema/cms";
import type { z } from "zod";

type ContentTypeFormValues = z.infer<typeof ContentTypeFormSchema>;
type ContentFieldFormValues = z.infer<typeof ContentFieldFormSchema>;
type ContentItemFormValues = z.infer<typeof ContentItemFormSchema>;

type ContentItemMutationInput = ContentItemFormValues & {
  fieldValues?: ContentFieldValueInput[];
};

type UpdateContentTypeVariables = {
  id: string;
  data: Partial<ContentType>;
};

type DeleteContentTypeVariables = {
  id: string;
};

type CreateContentFieldVariables = {
  contentTypeId: string;
  data: ContentFieldFormValues;
};

type UpdateContentFieldVariables = {
  contentTypeId: string;
  fieldId: string;
  data: Partial<ContentField>;
};

type DeleteContentFieldVariables = {
  contentTypeId: string;
  fieldId: string;
};

type CreateContentItemVariables = {
  contentTypeId: string;
  data: ContentItemMutationInput;
};

type UpdateContentItemVariables = {
  contentTypeId: string;
  itemId: string;
  data: Partial<ContentItem> & {
    fieldValues?: ContentFieldValueInput[];
  };
};

type DeleteContentItemVariables = {
  contentTypeId: string;
  itemId: string;
};

const cmsKeys = {
  all: ["cms"] as const,
  contentTypes: () => [...cmsKeys.all, "contentTypes"] as const,
  contentFields: (contentTypeId: string) =>
    [...cmsKeys.all, "contentFields", contentTypeId] as const,
  contentItems: (contentTypeId: string) =>
    [...cmsKeys.all, "contentItems", contentTypeId] as const,
  publicContent: () => [...cmsKeys.all, "public-content"] as const,
  publicContentItem: () => [...cmsKeys.all, "public-content-item"] as const,
};

function invalidateContentTypeDependencies(
  queryClient: ReturnType<typeof useQueryClient>,
  contentTypeId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: cmsKeys.contentFields(contentTypeId),
    exact: true,
  });
  void queryClient.invalidateQueries({
    queryKey: cmsKeys.contentItems(contentTypeId),
    exact: true,
  });
  void queryClient.invalidateQueries({
    queryKey: cmsKeys.publicContent(),
  });
  void queryClient.invalidateQueries({
    queryKey: cmsKeys.publicContentItem(),
  });
}

export const useCMSManager = () => {
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");

  const queryClient = useQueryClient();

  const contentTypesQuery = useQuery<ContentType[], Error>({
    queryKey: cmsKeys.contentTypes(),
    queryFn: () => getContentTypes(),
  });

  const contentFieldsQuery = useQuery<ContentField[], Error>({
    queryKey: cmsKeys.contentFields(selectedTypeId),
    queryFn: () =>
      getContentFieldsByContentType({
        data: { contentTypeId: selectedTypeId },
      }),
    enabled: selectedTypeId.length > 0,
  });

  const contentItemsQuery = useQuery<ContentItem[], Error>({
    queryKey: cmsKeys.contentItems(selectedTypeId),
    queryFn: () =>
      getContentItemsByContentType({
        data: { contentTypeId: selectedTypeId },
      }),
    enabled: selectedTypeId.length > 0,
  });

  const createTypeMutation = useMutation<
    ContentType,
    Error,
    ContentTypeFormValues
  >({
    mutationFn: (data) =>
      createContentType({
        data,
      }),
    onSuccess: (createdType) => {
      queryClient.setQueryData<ContentType[]>(
        cmsKeys.contentTypes(),
        (previous) => [...(previous ?? []), createdType],
      );
    },
  });

  const updateTypeMutation = useMutation<
    ContentType,
    Error,
    UpdateContentTypeVariables
  >({
    mutationFn: ({ id, data }) =>
      updateContentType({
        data: { id, data },
      }),
    onSuccess: (updatedType, variables) => {
      queryClient.setQueryData<ContentType[]>(
        cmsKeys.contentTypes(),
        (previous) =>
          previous?.map((type) =>
            type.id === variables.id ? updatedType : type,
          ) ?? [],
      );
    },
  });

  const deleteTypeMutation = useMutation<
    { success: true },
    Error,
    DeleteContentTypeVariables
  >({
    mutationFn: ({ id }) =>
      deleteContentType({
        data: { id },
      }),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<ContentType[]>(
        cmsKeys.contentTypes(),
        (previous) =>
          previous?.filter((type) => type.id !== variables.id) ?? [],
      );

      queryClient.removeQueries({
        queryKey: cmsKeys.contentFields(variables.id),
        exact: true,
      });
      queryClient.removeQueries({
        queryKey: cmsKeys.contentItems(variables.id),
        exact: true,
      });

      void queryClient.invalidateQueries({
        queryKey: cmsKeys.publicContent(),
      });
      void queryClient.invalidateQueries({
        queryKey: cmsKeys.publicContentItem(),
      });

      if (selectedTypeId === variables.id) {
        setSelectedTypeId("");
      }
    },
  });

  const createFieldMutation = useMutation<
    ContentField,
    Error,
    CreateContentFieldVariables
  >({
    mutationFn: ({ contentTypeId, data }) =>
      createContentField({
        data: { contentTypeId, data },
      }),
    onSuccess: (createdField, variables) => {
      queryClient.setQueryData<ContentField[]>(
        cmsKeys.contentFields(variables.contentTypeId),
        (previous) => [...(previous ?? []), createdField],
      );
    },
  });

  const updateFieldMutation = useMutation<
    ContentField,
    Error,
    UpdateContentFieldVariables
  >({
    mutationFn: ({ contentTypeId, fieldId, data }) =>
      updateContentField({
        data: { contentTypeId, fieldId, data },
      }),
    onSuccess: (updatedField, variables) => {
      queryClient.setQueryData<ContentField[]>(
        cmsKeys.contentFields(variables.contentTypeId),
        (previous) =>
          previous?.map((field) =>
            field.id === variables.fieldId ? updatedField : field,
          ) ?? [],
      );
    },
  });

  const deleteFieldMutation = useMutation<
    { success: true },
    Error,
    DeleteContentFieldVariables
  >({
    mutationFn: ({ contentTypeId, fieldId }) =>
      deleteContentField({
        data: { contentTypeId, fieldId },
      }),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<ContentField[]>(
        cmsKeys.contentFields(variables.contentTypeId),
        (previous) =>
          previous?.filter((field) => field.id !== variables.fieldId) ?? [],
      );

      invalidateContentTypeDependencies(queryClient, variables.contentTypeId);
    },
  });

  const createItemMutation = useMutation<
    ContentItem,
    Error,
    CreateContentItemVariables
  >({
    mutationFn: ({ contentTypeId, data }) =>
      createContentItem({
        data: { contentTypeId, data },
      }),
    onSuccess: (createdItem, variables) => {
      queryClient.setQueryData<ContentItem[]>(
        cmsKeys.contentItems(variables.contentTypeId),
        (previous) => [...(previous ?? []), createdItem],
      );

      invalidateContentTypeDependencies(queryClient, variables.contentTypeId);
    },
  });

  const updateItemMutation = useMutation<
    ContentItem,
    Error,
    UpdateContentItemVariables
  >({
    mutationFn: ({ contentTypeId, itemId, data }) =>
      updateContentItem({
        data: { contentTypeId, itemId, data },
      }),
    onSuccess: (updatedItem, variables) => {
      queryClient.setQueryData<ContentItem[]>(
        cmsKeys.contentItems(variables.contentTypeId),
        (previous) =>
          previous?.map((item) =>
            item.id === variables.itemId ? updatedItem : item,
          ) ?? [],
      );

      invalidateContentTypeDependencies(queryClient, variables.contentTypeId);
    },
  });

  const deleteItemMutation = useMutation<
    { success: true },
    Error,
    DeleteContentItemVariables
  >({
    mutationFn: ({ contentTypeId, itemId }) =>
      deleteContentItem({
        data: { contentTypeId, itemId },
      }),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<ContentItem[]>(
        cmsKeys.contentItems(variables.contentTypeId),
        (previous) =>
          previous?.filter((item) => item.id !== variables.itemId) ?? [],
      );

      invalidateContentTypeDependencies(queryClient, variables.contentTypeId);
    },
  });

  const handleCreateType = useCallback(
    (data: ContentTypeFormValues) => {
      createTypeMutation.mutate(data);
    },
    [createTypeMutation],
  );

  const handleCreateField = useCallback(
    (data: ContentFieldFormValues) => {
      if (!selectedTypeId) {
        return;
      }

      createFieldMutation.mutate({
        contentTypeId: selectedTypeId,
        data,
      });
    },
    [createFieldMutation, selectedTypeId],
  );

  const handleCreateItem = useCallback(
    (data: ContentItemMutationInput) => {
      if (!selectedTypeId) {
        return;
      }

      const validatedItem = ContentItemFormSchema.parse({
        title: data.title,
        slug: data.slug,
        published: data.published,
      });

      createItemMutation.mutate({
        contentTypeId: selectedTypeId,
        data: {
          ...validatedItem,
          fieldValues: data.fieldValues,
        },
      });
    },
    [createItemMutation, selectedTypeId],
  );

  const selectType = useCallback((typeId: string) => {
    setSelectedTypeId(typeId);
  }, []);

  const contentTypes = contentTypesQuery.data ?? [];
  const contentFields = contentFieldsQuery.data ?? [];
  const contentItems = contentItemsQuery.data ?? [];

  const selectedType = useMemo(
    () => contentTypes.find((type) => type.id === selectedTypeId),
    [contentTypes, selectedTypeId],
  );

  return {
    selectedTypeId,
    selectedType,

    contentTypes,
    contentFields,
    contentItems,

    typesLoading: contentTypesQuery.isLoading,
    fieldsLoading: contentFieldsQuery.isLoading,
    itemsLoading: contentItemsQuery.isLoading,

    typesFetching: contentTypesQuery.isFetching,
    fieldsFetching: contentFieldsQuery.isFetching,
    itemsFetching: contentItemsQuery.isFetching,

    contentTypesError: contentTypesQuery.error,
    contentFieldsError: contentFieldsQuery.error,
    contentItemsError: contentItemsQuery.error,

    createTypeMutation,
    updateTypeMutation,
    deleteTypeMutation,

    createFieldMutation,
    updateFieldMutation,
    deleteFieldMutation,

    createItemMutation,
    updateItemMutation,
    deleteItemMutation,

    handleCreateType,
    handleCreateField,
    handleCreateItem,
    selectType,
  };
};

export type CMSManagerResult = ReturnType<typeof useCMSManager>;

export type CMSMutationResult<TData, TVariables> = UseMutationResult<
  TData,
  Error,
  TVariables
>;
