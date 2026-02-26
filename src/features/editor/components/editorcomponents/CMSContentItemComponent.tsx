"use client";

import React from "react";
import { useCMSContentItem, useElementHandler } from "@/hooks";
import { EditorComponentProps } from "@/features/editor";
import { CMSContentItemElement } from "@/features/editor";
import { ContentItem } from "@/features/cms";
import ElementLoader from "../ElementLoader";
import { getFieldValue } from "@/hooks";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useEditorElement, eventsStyle, CMSEmptyState } from "./shared";

const CMSContentItemComponent = ({ element, data }: EditorComponentProps) => {
  const cmsElement = element as CMSContentItemElement;
  const { getCommonProps } = useElementHandler();
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const safeStyles = elementHelper.getSafeStyles(cmsElement);

  const settings = cmsElement.settings || {};
  const { contentTypeId, itemSlug } = settings;

  const { contentItem } = useCMSContentItem(
    contentTypeId || "",
    itemSlug || "",
  );

  const itemToRender = (data as ContentItem | undefined) || contentItem;

  const rootProps = {
    ref: elementRef as React.RefObject<HTMLDivElement>,
    "data-element-id": element.id,
    "data-element-type": element.type,
    ...getCommonProps(cmsElement),
    ...eventHandlers,
    style: {
      ...safeStyles,
      width: "100%",
      height: "100%",
      ...eventsStyle(eventsActive),
    },
  };

  if (!contentTypeId) {
    return (
      <CMSEmptyState
        {...rootProps}
        title="CMS Content Item"
        description="Configure content type and slug in settings"
      />
    );
  }

  return (
    <div {...rootProps}>
      {cmsElement.elements?.length ? (
        <ElementLoader
          elements={cmsElement.elements}
          data={itemToRender as unknown as Record<string, unknown>}
        />
      ) : itemToRender ? (
        <article className="max-w-4xl mx-auto">
          <header className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{itemToRender.title}</h1>
            <div className="text-sm text-gray-600">
              By {getFieldValue(itemToRender, "author")} •{" "}
              {itemToRender.createdAt
                ? new Date(itemToRender.createdAt).toLocaleDateString()
                : ""}
            </div>
          </header>

          {getFieldValue(itemToRender, "excerpt") && (
            <p className="text-lg text-gray-700 mb-6 italic">
              {getFieldValue(itemToRender, "excerpt")}
            </p>
          )}

          <div className="prose prose-lg max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html:
                  getFieldValue(itemToRender, "content") ||
                  "Sample content would be rendered here.",
              }}
            />
          </div>

          <footer className="mt-8 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Published: {itemToRender.published ? "Yes" : "No"} • Slug:{" "}
              {itemToRender.slug}
            </div>
          </footer>
        </article>
      ) : (
        <div className="flex items-center justify-center text-gray-500">
          Loading content item...
        </div>
      )}
    </div>
  );
};

export default CMSContentItemComponent;
