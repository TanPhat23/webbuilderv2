import React from "react";
import { EditorComponentProps } from "@/features/editor";
import { CMSContentListElement } from "@/features/editor";
import { ContentItem } from "@/features/cms";
import { LayoutGroup } from "framer-motion";
import ElementLoader from "../ElementLoader";
import { getFieldValue, useCMSContent } from "@/features/cms/hooks/useCMSContent";
import { useCanvasElement, CMSEmptyState } from "./shared";

const CMSContentListComponent = ({ element, data }: EditorComponentProps) => {
  const cmsElement = element as CMSContentListElement;
  const { rootProps } = useCanvasElement(cmsElement);
  const settings = cmsElement.settings || {};
  const {
    contentTypeId,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    displayMode = "list",
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

  if (!contentTypeId) {
    return (
      <CMSEmptyState
        {...rootProps}
        title="CMS Content List"
        description="Configure content type in settings"
      />
    );
  }

  return (
    <div
      {...rootProps}
      className={
        displayMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : ""
      }
    >
      <LayoutGroup>
        {limitedItems.map((item, index) => (
          <div
            key={item.id || index}
            className={displayMode === "list" ? "mb-4" : ""}
          >
            {cmsElement.elements?.length ? (
              <ElementLoader
                elements={cmsElement.elements}
                data={item as unknown as Record<string, unknown>}
              />
            ) : (
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold text-lg mb-2">
                  {getFieldValue(item, "title") || `Item ${index + 1}`}
                </h3>
                <p className="text-gray-600 text-sm">
                  {getFieldValue(item, "content") || "Sample content"}
                </p>
                <div className="text-xs text-gray-400 mt-2">
                  {getFieldValue(item, "createdAt")
                    ? new Date(
                        getFieldValue(item, "createdAt")!,
                      ).toLocaleDateString()
                    : ""}
                </div>
              </div>
            )}
          </div>
        ))}
      </LayoutGroup>
    </div>
  );
};

export default CMSContentListComponent;
