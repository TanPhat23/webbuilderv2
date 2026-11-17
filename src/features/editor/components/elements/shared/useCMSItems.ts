import type { ContentItem } from "@/features/cms";
import {
  useCMSContent,
  type UseCMSContentOptions,
} from "@/features/cms/hooks/useCMSContent";

interface UseCMSItemsOptions
  extends Pick<UseCMSContentOptions, "contentTypeId" | "sortBy" | "sortOrder"> {
  /** Maximum number of items to render (also used as the fetch limit). */
  limit: number;
  /** Items passed down by a parent repeater; take precedence over fetching. */
  data?: unknown;
}

/**
 * Resolves the items a CMS list/grid element should render: the parent's
 * `data` array when present, otherwise the content fetched for the configured
 * content type, capped at `limit`.
 */
export function useCMSItems({
  data,
  contentTypeId,
  limit,
  sortBy,
  sortOrder,
}: UseCMSItemsOptions): ContentItem[] {
  const { contentItems } = useCMSContent({
    contentTypeId,
    limit,
    sortBy,
    sortOrder,
    enabled: !!contentTypeId,
  });

  const items: ContentItem[] = Array.isArray(data)
    ? (data as ContentItem[])
    : contentItems?.length
      ? contentItems
      : [];

  return items.slice(0, limit);
}
