import React from "react";
import type { EditorElement } from "@/types/global.type";
import type { CMSContentGridElement, CMSContentItemElement, CMSContentListElement } from "@/types/elements";
import { getView } from "@/features/elements/registry";
import type { ViewProps } from "@/features/elements/view-props";
import { useCMSFetch, useCMSItemList } from "../hooks/useCMSFetch";
import { PreviewCMSFeedback } from "./PreviewCMSFeedback";

const parseItem = (body: unknown) => body as Record<string, unknown> | undefined;

type RenderElements = (
  elements: EditorElement[],
  data?: Record<string, unknown>,
) => React.ReactNode;

export function PreviewCMSCollection({
  element,
  rootProps,
  renderElements,
}: ViewProps<CMSContentGridElement | CMSContentListElement> & {
  renderElements: RenderElements;
}) {
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
      <React.Fragment key={item.id || index}>
        {renderElements(element.elements, item)}
      </React.Fragment>
    ))}
  </View>;
}

export function PreviewCMSItem({
  element,
  rootProps,
  renderElements,
}: ViewProps<CMSContentItemElement> & {
  renderElements: RenderElements;
}) {
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
    {renderElements(element.elements, item)}
  </View>;
}
