import React from "react";
import type { EditorElement } from "../types/global.type";
import type { CMSContentGridElement, CMSContentItemElement, CMSContentListElement } from "../types/elements";
import { getView } from "../elements/registry";
import type { ViewProps } from "../elements/view-props";
import { useSiteNavigationOptional } from "../elements/context/SiteNavigationContext";
import { usePublicCMSQuery, useCMSItemList } from "./useCMSFetch";
import { PreviewCMSFeedback } from "./PreviewCMSFeedback";

const parseItem = (body: unknown): Record<string, unknown> | undefined =>
  body !== null && typeof body === "object" && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : undefined;

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
}): React.JSX.Element | null {
  const siteNav = useSiteNavigationOptional();
  const {
    contentTypeId,
    limit = element.type === "CMSContentGrid" ? 6 : 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = element.settings ?? {};
  const previewProjectId =
    siteNav?.mode.kind === "preview" ? siteNav.projectId : undefined;
  const { data: items, loading, error } = useCMSItemList({
    contentTypeId,
    limit,
    sortBy,
    sortOrder,
    projectId: previewProjectId,
  });

  if (PreviewCMSFeedback.isActive(loading, error)) {
    return (
      <PreviewCMSFeedback
        elementId={element.id}
        styles={rootProps.style ?? {}}
        draggable={rootProps.draggable}
        loading={loading}
        error={error}
      />
    );
  }

  const View = getView(element.type);
  if (!View) return null;
  return (
    <View element={element} rootProps={rootProps} mode="preview">
      {items.map((item, index) => {
        const record =
          typeof item === "object" && item !== null
            ? (item as Record<string, unknown>)
            : {};
        const key =
          typeof record.id === "string" || typeof record.id === "number"
            ? record.id
            : index;
        return (
          <React.Fragment key={key}>
            {renderElements(element.elements, record)}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function encodeSlugPath(slug: string): string {
  return slug
    .split("/")
    .filter((segment) => segment.length > 0)
    .map(encodeURIComponent)
    .join("/");
}

export function PreviewCMSItem({
  element,
  rootProps,
  renderElements,
}: ViewProps<CMSContentItemElement> & {
  renderElements: RenderElements;
}): React.JSX.Element | null {
  const siteNav = useSiteNavigationOptional();
  const { contentTypeId: configuredContentTypeId, itemSlug: configuredSlug } =
    element.settings ?? {};
  const effectiveContentTypeId =
    configuredContentTypeId || siteNav?.contentTypeId || "";
  const effectiveSlug = configuredSlug || siteNav?.itemSlug || "";
  const previewQuery =
    siteNav?.mode.kind === "preview" && siteNav.projectId
      ? `?projectId=${encodeURIComponent(siteNav.projectId)}`
      : "";
  const { data: item, loading, error } = usePublicCMSQuery(
    effectiveContentTypeId && effectiveSlug
      ? `/api/cms/${encodeURIComponent(effectiveContentTypeId)}/item/${encodeSlugPath(effectiveSlug)}${previewQuery}`
      : null,
    parseItem,
    undefined,
  );

  if (PreviewCMSFeedback.isActive(loading, error)) {
    return (
      <PreviewCMSFeedback
        elementId={element.id}
        styles={rootProps.style ?? {}}
        draggable={rootProps.draggable}
        loading={loading}
        error={error}
      />
    );
  }

  const View = getView(element.type);
  if (!View) return null;
  return (
    <View element={element} rootProps={rootProps} mode="preview">
      {renderElements(element.elements, item)}
    </View>
  );
}
