import { useQuery } from "@tanstack/react-query";
import { cmsService } from "@/services/cms";
import { ContentItem, ContentType } from "@/interfaces/cms.interface";

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
  error: any;
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
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
  error: any;
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    contentItem,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Helper function to get a specific field value from a content item
 * Handles both direct properties and fieldValues structure
 */
export const getFieldValue = (
  contentItem: ContentItem,
  fieldName: string,
): any => {
  if (contentItem.hasOwnProperty(fieldName)) {
    return (contentItem as any)[fieldName];
  }

  if (contentItem.fieldValues) {
    const fieldValue = contentItem.fieldValues.find(
      (fv) => fv.field?.name === fieldName,
    );
    return fieldValue?.value;
  }

  return undefined;
};

/**
 * Helper function to get all field values as a simple object
 * Useful for spreading into components or easy access
 */
export const getFieldValues = (
  contentItem: ContentItem,
): Record<string, any> => {
  const values: Record<string, any> = {};

  // Add direct properties
  Object.keys(contentItem).forEach((key) => {
    if (key !== "fieldValues") {
      values[key] = (contentItem as any)[key];
    }
  });

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
 * Hook for fetching content types (useful for dynamic content type selection)
 */
export const useCMSContentTypes = () => {
  return useQuery<ContentType[]>({
    queryKey: ["cms-content-types"],
    queryFn: () => cmsService.getContentTypes(),
    staleTime: 1000 * 60 * 15, // 15 minutes - content types don't change often
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};
