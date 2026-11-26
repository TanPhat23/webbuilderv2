import { useCallback, useMemo } from "react";
import { useCurrentPage } from "@/features/projects/hooks/useProjects";
import {
  getFieldValues,
  useCMSContent,
} from "@/features/cms/hooks/useCMSContent";
import type { ContentItem } from "@/features/cms/interfaces/cms.interface";
import {
  defaultSampleParams,
  effectivePageSlug,
  extractRouteParamNames,
  hasCatchAllSegment,
  hasDynamicSegments,
  instantiateRoutePath,
  pageRoutePath,
} from "@webbuilder/site-runtime/routing";
import { useDynamicPreviewStore } from "../store/dynamic-preview-store";

export interface DynamicPagePreviewState {
  readonly pageId?: string;
  readonly isDynamic: boolean;
  readonly isCatchAll: boolean;
  readonly patternPath: string;
  readonly previewPath: string;
  readonly previewSplat: string;
  readonly contentTypeId?: string;
  readonly paramNames: readonly string[];
  readonly params: Readonly<Record<string, string>>;
  readonly items: readonly ContentItem[];
  readonly isLoadingItems: boolean;
  readonly selectedItem?: ContentItem;
  readonly previewData?: Record<string, unknown>;
  readonly setSelectedItemSlug: (slug: string) => void;
  readonly setSampleParam: (name: string, value: string) => void;
}

const EMPTY_PARAMS: Readonly<Record<string, string>> = {};
const EMPTY_ITEMS: readonly ContentItem[] = [];

export function useDynamicPagePreview(): DynamicPagePreviewState {
  const currentPage = useCurrentPage();
  const pageId = currentPage?.Id;
  const isDynamic = currentPage?.Type === "dp";
  const contentTypeId =
    isDynamic && currentPage?.ContentTypeId
      ? currentPage.ContentTypeId
      : undefined;

  const storedItemSlug = useDynamicPreviewStore((state) =>
    pageId ? state.selectedItemSlugByPage[pageId] : undefined,
  );
  const storedSampleParams = useDynamicPreviewStore((state) =>
    pageId ? state.sampleParamsByPage[pageId] : undefined,
  );
  const storeSetItemSlug = useDynamicPreviewStore(
    (state) => state.setSelectedItemSlug,
  );
  const storeSetSampleParam = useDynamicPreviewStore(
    (state) => state.setSampleParam,
  );

  const { contentItems, isLoading: isLoadingItems } = useCMSContent({
    contentTypeId,
    enabled: Boolean(contentTypeId),
  });

  const slug = useMemo(
    () =>
      currentPage
        ? effectivePageSlug({ name: currentPage.Name, slug: currentPage.Slug })
        : "",
    [currentPage],
  );
  const patternPath = useMemo(
    () =>
      currentPage
        ? pageRoutePath({ name: currentPage.Name, slug: currentPage.Slug })
        : "/",
    [currentPage],
  );

  const paramNames = useMemo<readonly string[]>(() => {
    if (!isDynamic) return [];
    const extracted = extractRouteParamNames(slug);
    if (extracted.length > 0) return extracted;
    return ["slug"];
  }, [isDynamic, slug]);

  const isCatchAll = isDynamic && hasCatchAllSegment(slug);

  const items = contentTypeId ? contentItems : EMPTY_ITEMS;
  const selectedItem = useMemo<ContentItem | undefined>(() => {
    if (!contentTypeId || items.length === 0) return undefined;
    if (storedItemSlug) {
      const found = items.find((item) => item.slug === storedItemSlug);
      if (found) return found;
    }
    return items[0];
  }, [contentTypeId, items, storedItemSlug]);

  const params = useMemo<Readonly<Record<string, string>>>(() => {
    if (!isDynamic) return EMPTY_PARAMS;
    const base = hasDynamicSegments(slug)
      ? defaultSampleParams(slug)
      : { slug: "sample-post" };
    const merged: Record<string, string> = {
      ...base,
      ...(storedSampleParams ?? {}),
    };
    if (selectedItem) {
      if ("slug" in merged) {
        merged.slug = selectedItem.slug;
      } else if (paramNames.length > 0) {
        const primaryParam = paramNames[0]!;
        merged[primaryParam] = selectedItem.slug;
      }
    }
    return merged;
  }, [isDynamic, slug, storedSampleParams, selectedItem, paramNames]);

  const previewPath = useMemo(() => {
    if (!currentPage) return "/";
    if (!isDynamic) return patternPath;
    return instantiateRoutePath(slug, params, selectedItem?.slug);
  }, [currentPage, isDynamic, patternPath, slug, params, selectedItem]);

  const previewSplat = previewPath.replace(/^\/+/, "");

  const previewData = useMemo<Record<string, unknown> | undefined>(() => {
    if (!isDynamic) return undefined;
    const itemFields = selectedItem ? getFieldValues(selectedItem) : undefined;
    if (!itemFields && Object.keys(params).length === 0) return undefined;
    return {
      ...params,
      ...(itemFields ?? {}),
    };
  }, [isDynamic, params, selectedItem]);

  const setSelectedItemSlug = useCallback(
    (nextSlug: string): void => {
      if (!pageId) return;
      storeSetItemSlug(pageId, nextSlug);
    },
    [pageId, storeSetItemSlug],
  );

  const setSampleParam = useCallback(
    (name: string, value: string): void => {
      if (!pageId) return;
      storeSetSampleParam(pageId, name, value);
    },
    [pageId, storeSetSampleParam],
  );

  return {
    pageId,
    isDynamic,
    isCatchAll,
    patternPath,
    previewPath,
    previewSplat,
    contentTypeId,
    paramNames,
    params,
    items,
    isLoadingItems,
    selectedItem,
    previewData,
    setSelectedItemSlug,
    setSampleParam,
  };
}
