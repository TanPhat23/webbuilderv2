import CMSCollectionView from "@/features/elements/views/CMSCollectionView";
import React from "react";
import { EditorComponentProps } from "@/features/editor";
import { CMSContentListElement } from "@/features/editor";
import { LayoutGroup } from "framer-motion";
import { ChildElements } from "../context/ChildElementLoaderContext";
import { getFieldValue } from "@/features/cms/hooks/useCMSContent";
import { useCanvasElement, CMSEmptyState, useCMSItems } from "./shared";

const CMSContentListComponent = ({ element, data }: EditorComponentProps) => {
  const cmsElement = element as CMSContentListElement;
  const { rootProps } = useCanvasElement(cmsElement);
  const settings = cmsElement.settings || {};
  const {
    contentTypeId,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = settings;

  const limitedItems = useCMSItems({
    data,
    contentTypeId,
    limit,
    sortBy,
    sortOrder,
  });

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
    <LayoutGroup>
      <CMSCollectionView element={cmsElement} rootProps={rootProps} mode="edit">
        {limitedItems.map((item, index) => (
          <React.Fragment key={item.id || index}>
            {cmsElement.elements?.length ? (
              <ChildElements
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
          </React.Fragment>
        ))}
      </CMSCollectionView>
    </LayoutGroup>
  );
};

export default CMSContentListComponent;
