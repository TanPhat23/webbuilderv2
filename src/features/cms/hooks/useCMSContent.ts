import { useQuery } from "@tanstack/react-query";
import { cmsService } from "@/features/cms";
import { ContentItem, ContentType } from "@/features/cms";
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
  error: Error | null;
  refetch: () => void;
}

export const useCMSContent = (
  options: UseCMSContentOptions = {},
): UseCMSContentResult => {
  const { contentTypeId, limit, sortBy, sortOrder, enabled = true } = options;

  const {
    data: contentItemsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["cms-public-content", contentTypeId, limit, sortBy, sortOrder],
    queryFn: () =>
      cmsService.getPublicContent({
        contentTypeId,
        limit,
        sortBy,
        sortOrder,
      }),
    enabled: enabled && !!contentTypeId,
    ...QUERY_CONFIG.DEFAULT,
  });
  const contentItems = contentItemsData ?? [];

  return {
    contentItems,
    contentTypes: [], // Could be populated if needed
    isLoading,
    error,
    refetch,
  };
};

export interface UseCMSContentItemResult {
  contentItem: ContentItem | undefined;
  isLoading: boolean;
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
    error,
    refetch,
  } = useQuery({
    queryKey: ["cms-public-content-item", contentTypeId, slug],
    queryFn: () => cmsService.getPublicContentItem(contentTypeId, slug),
    enabled: !!contentTypeId && !!slug,
    ...QUERY_CONFIG.DEFAULT,
  });

  return {
    contentItem,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Helper function to get a specific field value from a content item.
 * Handles both direct properties and fieldValues structure.
 *
 * @param contentItem - The content item to extract the field from.
 * @param fieldName   - The name of the field to retrieve.
 * @returns The field value, or `undefined` if not found.
 */
export const getFieldValue = (
  contentItem: ContentItem,
  fieldName: string,
): string | undefined => {
  // Check direct properties first
  if (fieldName in contentItem) {
    const value = (contentItem as unknown as Record<string, unknown>)[
      fieldName
    ];
    return value != null ? String(value) : undefined;
  }

  // Fall back to fieldValues array
  if (contentItem.fieldValues) {
    const fieldValue = contentItem.fieldValues.find(
      (fv) => fv.field?.name === fieldName,
    );
    return fieldValue?.value;
  }

  return undefined;
};

/**
 * Helper function to get all field values as a simple object.
 * Useful for spreading into components or easy access.
 *
 * @param contentItem - The content item to extract fields from.
 * @returns A flat record of field names to their values.
 */
export const getFieldValues = (
  contentItem: ContentItem,
): Record<string, unknown> => {
  const values: Record<string, unknown> = {};

  // Add direct properties
  for (const key of Object.keys(contentItem)) {
    if (key !== "fieldValues") {
      values[key] = (contentItem as unknown as Record<string, unknown>)[key];
    }
  }

  // Add field values
  if (contentItem.fieldValues) {
    contentItem.fieldValues.forEach((fv) => {
      if (fv.field?.name) {
        values[fv.field.name] = fv.value;
      }
    });
  }

  return values;
};

/**
 * Hook for fetching content types (useful for dynamic content type selection).
 */
export const useCMSContentTypes = () => {
  return useQuery<ContentType[]>({
    queryKey: ["cms-content-types"],
    queryFn: () => cmsService.getContentTypes(),
    ...QUERY_CONFIG.LONG,
  });
};
