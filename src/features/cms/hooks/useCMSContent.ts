import { useQuery } from "@tanstack/react-query";
import {
  getContentTypes,
  getPublicContent,
  getPublicContentItem,
} from "@/features/cms";
import type { ContentItem, ContentType } from "@/features/cms";
import { QUERY_CONFIG } from "@/utils/query/queryConfig";

export interface UseCMSContentOptions {
  contentTypeId?: string;
  limit?: number;
  sortBy?: "title" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  enabled?: boolean;
}

export interface UseCMSContentResult {
  contentItems: ContentItem[];
  contentTypes: ContentType[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

type ContentItemRecord = ContentItem & Record<string, unknown>;

export const useCMSContent = (
  options: UseCMSContentOptions = {},
): UseCMSContentResult => {
  const { contentTypeId, limit, sortBy, sortOrder, enabled = true } = options;

  const {
    data: contentItemsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<ContentItem[], Error>({
    queryKey: ["cms-public-content", contentTypeId, limit, sortBy, sortOrder],
    queryFn: () =>
      getPublicContent({
        data: {
          contentTypeId,
          limit,
          sortBy,
          sortOrder,
        },
      }),
    enabled: enabled && Boolean(contentTypeId),
    ...QUERY_CONFIG.DEFAULT,
  });

  return {
    contentItems: contentItemsData ?? [],
    contentTypes: [],
    isLoading,
    isFetching,
    error,
    refetch: () => {
      void refetch();
    },
  };
};

export interface UseCMSContentItemResult {
  contentItem: ContentItem | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useCMSContentItem = (
  contentTypeId: string,
  slug: string,
): UseCMSContentItemResult => {
  const {
    data: contentItem,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<ContentItem, Error>({
    queryKey: ["cms-public-content-item", contentTypeId, slug],
    queryFn: () =>
      getPublicContentItem({
        data: { contentTypeId, slug },
      }),
    enabled: Boolean(contentTypeId) && Boolean(slug),
    ...QUERY_CONFIG.DEFAULT,
  });

  return {
    contentItem,
    isLoading,
    isFetching,
    error,
    refetch: () => {
      void refetch();
    },
  };
};

/**
 * Helper function to get a specific field value from a content item.
 * Handles both direct properties and fieldValues structure.
 */
export const getFieldValue = (
  contentItem: ContentItem,
  fieldName: string,
): string | undefined => {
  const record = contentItem as ContentItemRecord;

  if (fieldName in record) {
    const value = record[fieldName];
    return value != null ? String(value) : undefined;
  }

  const fieldValue = contentItem.fieldValues?.find(
    (entry) => entry.field?.name === fieldName,
  );

  return fieldValue?.value;
};

/**
 * Helper function to get all field values as a simple object.
 * Useful for spreading into components or easy access.
 */
export const getFieldValues = (
  contentItem: ContentItem,
): Record<string, unknown> => {
  const record = contentItem as ContentItemRecord;
  const values: Record<string, unknown> = {};

  for (const key of Object.keys(record)) {
    if (key !== "fieldValues") {
      values[key] = record[key];
    }
  }

  contentItem.fieldValues?.forEach((entry) => {
    if (entry.field?.name) {
      values[entry.field.name] = entry.value;
    }
  });

  return values;
};

/**
 * Hook for fetching content types.
 */
export const useCMSContentTypes = () => {
  return useQuery<ContentType[], Error>({
    queryKey: ["cms-content-types"],
    queryFn: () => getContentTypes(),
    ...QUERY_CONFIG.LONG,
  });
};
