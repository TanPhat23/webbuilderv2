import React from "react";
import type { CMSContentGridElement, CMSContentItemElement, CMSContentListElement } from "@/types/elements";
import { getView } from "@/features/elements/registry";
import type { ViewProps } from "@/features/elements/view-props";
import { useCMSFetch, useCMSItemList } from "../hooks/useCMSFetch";
import PreviewElementLoader from "./PreviewElementLoader";
import { PreviewCMSFeedback } from "./PreviewCMSFeedback";

const parseItem = (body: unknown) => body as Record<string, unknown> | undefined;

export function PreviewCMSCollection({ element, rootProps }: ViewProps<CMSContentGridElement | CMSContentListElement>) {
  const { contentTypeId, limit = element.type === "CMSContentGrid" ? 6 : 10, sortBy = "createdAt", sortOrder = "desc" } =
    element.settings ?? {};
  const { data: items, loading, error } = useCMSItemList({ contentTypeId, limit, sortBy, sortOrder });

  if (PreviewCMSFeedback.isActive(loading, error)) {
    return <PreviewCMSFeedback elementId={element.id} styles={rootProps.style ?? {}} draggable={rootProps.draggable} loading={loading} error={error} />;
  }

  const View = getView(element.type);
  if (!View) return null;
  return <View element={element} rootProps={rootProps} mode="preview">
    {items.map((item, index) => (
      <PreviewElementLoader key={item.id || index} elements={element.elements} data={item} />
    ))}
  </View>;
}

export function PreviewCMSItem({ element, rootProps }: ViewProps<CMSContentItemElement>) {
  const { contentTypeId, itemSlug } = element.settings ?? {};
  const { data: item, loading, error } = useCMSFetch(
    contentTypeId && itemSlug ? `/api/cms/${contentTypeId}/item/${itemSlug}` : null,
    parseItem,
    undefined,
  );

  if (PreviewCMSFeedback.isActive(loading, error)) {
    return <PreviewCMSFeedback elementId={element.id} styles={rootProps.style ?? {}} draggable={rootProps.draggable} loading={loading} error={error} />;
  }

  const View = getView(element.type);
  if (!View) return null;
  return <View element={element} rootProps={rootProps} mode="preview">
    <PreviewElementLoader elements={element.elements} data={item} />
  </View>;
}
