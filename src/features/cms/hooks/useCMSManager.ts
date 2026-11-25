import { useCallback, useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type QueryKey,
  type UseMutationResult,
} from "@tanstack/react-query";
import { createContentField, createContentItem, createContentType, deleteContentField, deleteContentItem, deleteContentType, listContentFieldsByContentType, listContentItemsByContentType, listContentTypes, updateContentField, updateContentItem, updateContentType } from "@/features/cms/api/cms.api";
import type { ContentField, ContentFieldValueInput, ContentItem, ContentType } from "@/features/cms/interfaces/cms.interface";
import {
  ContentFieldFormSchema,
  ContentItemFormSchema,
  ContentTypeFormSchema,
} from "@/features/cms/schema/cms";
import type { z } from "zod";
import { cmsKeys } from "../query-keys";

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
  data: Partial<ContentItemFormValues> & {
    fieldValues?: ContentFieldValueInput[];
  };
};

type DeleteContentItemVariables = {
  contentTypeId: string;
  itemId: string;
};

function appendCachedItem<T>(client: QueryClient, key: QueryKey, item: T) {
  client.setQueryData<T[]>(key, (previous) => [...(previous ?? []), item]);
}

function replaceCachedItem<T extends { id: string }>(
  client: QueryClient,
  key: QueryKey,
  id: string,
  item: T,
) {
  client.setQueryData<T[]>(key, (previous) =>
    (previous ?? []).map((entry) => entry.id === id ? item : entry),
  );
}

function removeCachedItem<T extends { id: string }>(client: QueryClient, key: QueryKey, id: string) {
  client.setQueryData<T[]>(key, (previous) =>
    (previous ?? []).filter((entry) => entry.id !== id),
  );
}

function invalidatePublicContent(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: cmsKeys.publicContent() });
  void queryClient.invalidateQueries({ queryKey: cmsKeys.publicContentItem() });
}

function invalidateContentTypeDependencies(queryClient: QueryClient, contentTypeId: string) {
  void queryClient.invalidateQueries({ queryKey: cmsKeys.contentFields(contentTypeId), exact: true });
  void queryClient.invalidateQueries({ queryKey: cmsKeys.contentItems(contentTypeId), exact: true });
  invalidatePublicContent(queryClient);
}

function useContentTypeMutations(
  queryClient: QueryClient,
  projectId: string | undefined,
  onDelete: (id: string) => void,
) {
  const createTypeMutation = useMutation<
    ContentType,
    Error,
    ContentTypeFormValues
  >({
    mutationFn: (data) =>
      createContentType({
        data: projectId ? { ...data, projectId } : data,
      }),
    onSuccess: (type) =>
      appendCachedItem(queryClient, cmsKeys.contentTypes(projectId), type),
  });

  const updateTypeMutation = useMutation<
    ContentType,
    Error,
    UpdateContentTypeVariables
  >({
    mutationFn: ({ id, data }) => updateContentType({ data: { id, data } }),
    onSuccess: (type, { id }) =>
      replaceCachedItem(queryClient, cmsKeys.contentTypes(projectId), id, type),
  });

  const deleteTypeMutation = useMutation<
    { success: true },
    Error,
    DeleteContentTypeVariables
  >({
    mutationFn: ({ id }) => deleteContentType({ data: { id } }),
    onSuccess: (_, { id }) => {
      removeCachedItem<ContentType>(
        queryClient,
        cmsKeys.contentTypes(projectId),
        id,
      );
      queryClient.removeQueries({ queryKey: cmsKeys.contentFields(id), exact: true });
      queryClient.removeQueries({ queryKey: cmsKeys.contentItems(id), exact: true });
      invalidatePublicContent(queryClient);
      onDelete(id);
    },
  });

  return { createTypeMutation, updateTypeMutation, deleteTypeMutation };
}

function useContentFieldMutations(queryClient: QueryClient) {
  const createFieldMutation = useMutation<ContentField, Error, CreateContentFieldVariables>({
    mutationFn: ({ contentTypeId, data }) => createContentField({ data: { contentTypeId, data } }),
    onSuccess: (field, { contentTypeId }) =>
      appendCachedItem(queryClient, cmsKeys.contentFields(contentTypeId), field),
  });

  const updateFieldMutation = useMutation<ContentField, Error, UpdateContentFieldVariables>({
    mutationFn: ({ contentTypeId, fieldId, data }) => updateContentField({ data: { contentTypeId, fieldId, data } }),
    onSuccess: (field, { contentTypeId, fieldId }) =>
      replaceCachedItem(queryClient, cmsKeys.contentFields(contentTypeId), fieldId, field),
  });

  const deleteFieldMutation = useMutation<{ success: true }, Error, DeleteContentFieldVariables>({
    mutationFn: ({ contentTypeId, fieldId }) => deleteContentField({ data: { contentTypeId, fieldId } }),
    onSuccess: (_, { contentTypeId, fieldId }) => {
      removeCachedItem<ContentField>(queryClient, cmsKeys.contentFields(contentTypeId), fieldId);
      invalidateContentTypeDependencies(queryClient, contentTypeId);
    },
  });

  return { createFieldMutation, updateFieldMutation, deleteFieldMutation };
}

function useContentItemMutations(queryClient: QueryClient) {
  const createItemMutation = useMutation<ContentItem, Error, CreateContentItemVariables>({
    mutationFn: ({ contentTypeId, data }) => createContentItem({ data: { contentTypeId, data } }),
    onSuccess: (item, { contentTypeId }) => {
      appendCachedItem(queryClient, cmsKeys.contentItems(contentTypeId), item);
      invalidateContentTypeDependencies(queryClient, contentTypeId);
    },
  });

  const updateItemMutation = useMutation<ContentItem, Error, UpdateContentItemVariables>({
    mutationFn: ({ contentTypeId, itemId, data }) => updateContentItem({ data: { contentTypeId, itemId, data } }),
    onSuccess: (item, { contentTypeId, itemId }) => {
      replaceCachedItem(queryClient, cmsKeys.contentItems(contentTypeId), itemId, item);
      invalidateContentTypeDependencies(queryClient, contentTypeId);
    },
  });

  const deleteItemMutation = useMutation<{ success: true }, Error, DeleteContentItemVariables>({
    mutationFn: ({ contentTypeId, itemId }) => deleteContentItem({ data: { contentTypeId, itemId } }),
    onSuccess: (_, { contentTypeId, itemId }) => {
      removeCachedItem<ContentItem>(queryClient, cmsKeys.contentItems(contentTypeId), itemId);
      invalidateContentTypeDependencies(queryClient, contentTypeId);
    },
  });

  return { createItemMutation, updateItemMutation, deleteItemMutation };
}

export const useCMSWorkspace = (projectId?: string) => {
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");

  const queryClient = useQueryClient();

  const contentTypesQuery = useQuery<ContentType[], Error>({
    queryKey: cmsKeys.contentTypes(projectId),
    queryFn: () =>
      listContentTypes({ data: projectId ? { projectId } : undefined }),
  });

  const contentFieldsQuery = useQuery<ContentField[], Error>({
    queryKey: cmsKeys.contentFields(selectedTypeId),
    queryFn: () =>
      listContentFieldsByContentType({
        data: { contentTypeId: selectedTypeId },
      }),
    enabled: selectedTypeId.length > 0,
  });

  const contentItemsQuery = useQuery<ContentItem[], Error>({
    queryKey: cmsKeys.contentItems(selectedTypeId),
    queryFn: () =>
      listContentItemsByContentType({
        data: { contentTypeId: selectedTypeId },
      }),
    enabled: selectedTypeId.length > 0,
  });

  const typeMutations = useContentTypeMutations(
    queryClient,
    projectId,
    (id) => {
      if (selectedTypeId === id) setSelectedTypeId("");
    },
  );
  const fieldMutations = useContentFieldMutations(queryClient);
  const itemMutations = useContentItemMutations(queryClient);
  const { createTypeMutation } = typeMutations;
  const { createFieldMutation } = fieldMutations;
  const { createItemMutation } = itemMutations;

  const createContentType = useCallback(
    (data: ContentTypeFormValues) => {
      createTypeMutation.mutate(data);
    },
    [createTypeMutation],
  );

  const createContentField = useCallback(
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

  const createContentItem = useCallback(
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

    ...typeMutations,
    ...fieldMutations,
    ...itemMutations,

    createContentType,
    createContentField,
    createContentItem,
    selectType,
  };
};

export type CMSWorkspaceResult = ReturnType<typeof useCMSWorkspace>;

export type CMSMutationResult<TData, TVariables> = UseMutationResult<
  TData,
  Error,
  TVariables
>;
