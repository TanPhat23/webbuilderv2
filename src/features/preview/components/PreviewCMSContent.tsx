import React from "react";
import type { EditorElement } from "@/types/global.type";
import type { CMSContentGridElement, CMSContentItemElement, CMSContentListElement } from "@/types/elements";
import { getView } from "@/features/elements/registry";
import type { ViewProps } from "@/features/elements/view-props";
import { useSiteNavigationOptional } from "@/features/elements/context/SiteNavigationContext";
import { usePublicCMSQuery, useCMSItemList } from "../hooks/useCMSFetch";
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
    {items.map((item, index) => {
      const record =
        typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
      const key = typeof record.id === "string" || typeof record.id === "number" ? record.id : index;
      return (
        <React.Fragment key={key}>
          {renderElements(element.elements, record)}
        </React.Fragment>
      );
    })}
  </View>;
}

export function PreviewCMSItem({
  element,
  rootProps,
  renderElements,
}: ViewProps<CMSContentItemElement> & {
  renderElements: RenderElements;
}) {
  const siteNav = useSiteNavigationOptional();
  const { contentTypeId, itemSlug: configuredSlug } = element.settings ?? {};
  const effectiveSlug = configuredSlug || siteNav?.itemSlug || "";
  const { data: item, loading, error } = usePublicCMSQuery(
    contentTypeId && effectiveSlug
      ? `/api/cms/${contentTypeId}/item/${encodeURIComponent(effectiveSlug)}`
      : null,
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
