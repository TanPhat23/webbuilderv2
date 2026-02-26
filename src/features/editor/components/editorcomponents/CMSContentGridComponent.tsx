import React from "react";

import { useElementHandler } from "@/hooks";
import { EditorComponentProps } from "@/features/editor";
import { CMSContentGridElement } from "@/features/editor";
import { ContentItem } from "@/features/cms";
import { LayoutGroup } from "framer-motion";
import ElementLoader from "../ElementLoader";
import { getFieldValue, useCMSContent } from "@/hooks";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useEditorElement, eventsStyle, CMSEmptyState } from "./shared";

const CMSContentGridComponent = ({ element, data }: EditorComponentProps) => {
  const cmsElement = element as CMSContentGridElement;

  const { getCommonProps } = useElementHandler();
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const safeStyles = elementHelper.getSafeStyles(cmsElement);

  const settings = cmsElement.settings || {};
  const {
    contentTypeId,
    limit = 6,
    sortBy = "createdAt",
    sortOrder = "desc",
    fieldsToShow = ["title", "content"],
  } = settings;

  const { contentItems } = useCMSContent({
    contentTypeId,
    limit,
    sortBy,
    sortOrder,
    enabled: !!contentTypeId,
  });

  const itemsToRender: ContentItem[] = Array.isArray(data)
    ? (data as ContentItem[])
    : contentItems?.length
      ? contentItems
      : [];

  const limitedItems = itemsToRender.slice(0, limit);

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
        title="CMS Content Grid"
        description="Configure content type in settings"
      />
    );
  }

  return (
    <div
      {...rootProps}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <LayoutGroup>
        {limitedItems.map((item, index) => (
          <div key={item.id || index} className="group">
            {cmsElement.elements?.length ? (
              <ElementLoader
                elements={cmsElement.elements}
                data={item as unknown as Record<string, unknown>}
              />
            ) : (
              <DefaultItemCard
                item={item}
                index={index}
                fieldsToShow={fieldsToShow}
              />
            )}
          </div>
        ))}
      </LayoutGroup>
    </div>
  );
};

interface DefaultItemCardProps {
  item: ContentItem;
  index: number;
  fieldsToShow: string[];
}

function DefaultItemCard({ item, index, fieldsToShow }: DefaultItemCardProps) {
  const KNOWN_FIELDS = [
    "title",
    "excerpt",
    "content",
    "image",
    "author",
    "date",
    "status",
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {fieldsToShow.includes("image") && getFieldValue(item, "image") && (
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          <img
            src={getFieldValue(item, "image")}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {fieldsToShow.includes("title") && (
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {item.title || `Item ${index + 1}`}
          </h3>
        )}

        {fieldsToShow.includes("excerpt") && getFieldValue(item, "excerpt") && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {getFieldValue(item, "excerpt")}
          </p>
        )}

        {fieldsToShow.includes("content") &&
          getFieldValue(item, "content") &&
          !getFieldValue(item, "excerpt") && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {getFieldValue(item, "content")?.substring(0, 120)}...
            </p>
          )}

        {fieldsToShow.includes("author") && getFieldValue(item, "author") && (
          <p className="text-gray-600 text-sm mb-2">
            By {getFieldValue(item, "author")}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          {fieldsToShow.includes("date") && (
            <span>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : ""}
            </span>
          )}
          {fieldsToShow.includes("status") && item.published && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Published
            </span>
          )}
        </div>

        {fieldsToShow
          .filter((f) => !KNOWN_FIELDS.includes(f))
          .map((fieldName) => {
            const fieldValue = getFieldValue(item, fieldName);
            if (!fieldValue) return null;
            return (
              <div key={fieldName} className="mt-2">
                <span className="text-xs font-medium text-gray-500 capitalize">
                  {fieldName}:
                </span>
                <span className="text-sm text-gray-700 ml-1">
                  {typeof fieldValue === "boolean"
                    ? fieldValue
                      ? "Yes"
                      : "No"
                    : String(fieldValue)}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default CMSContentGridComponent;
