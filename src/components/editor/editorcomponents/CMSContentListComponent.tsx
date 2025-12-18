import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useElementHandler } from "@/hooks";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { CMSContentListElement } from "@/interfaces/elements.interface";
import { LayoutGroup } from "framer-motion";
import ElementLoader from "../ElementLoader";
import { Database } from "lucide-react";
import { useCMSContent, getFieldValue } from "@/hooks";
import { elementHelper } from "@/lib/utils/element/elementhelper";

const CMSContentListComponent = ({ element, data }: EditorComponentProps) => {
  const cmsElement = element as CMSContentListElement;
  const { id } = useParams();
  const { getCommonProps } = useElementHandler();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: id as string,
    });

  const safeStyles = elementHelper.getSafeStyles(cmsElement);

  // Register events when element events change
  useEffect(() => {
    if (element.events) {
      registerEvents(element.events);
    }
  }, [element.events, registerEvents]);

  const eventHandlers = createEventHandlers();

  // Get CMS settings
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

  // Use provided data or CMS content
  const itemsToRender = Array.isArray(data)
    ? data
    : contentItems && contentItems.length > 0
      ? contentItems
      : [];

  // Apply limit
  const limitedItems = itemsToRender.slice(0, limit);

  if (!contentTypeId) {
    return (
      <div
        ref={elementRef as React.RefObject<HTMLDivElement>}
        data-element-id={element.id}
        data-element-type={element.type}
        {...getCommonProps(cmsElement)}
        {...eventHandlers}
        style={{
          ...safeStyles,
          width: "100%",
          height: "100%",
          cursor: eventsActive ? "pointer" : "inherit",
          userSelect: eventsActive ? "none" : "auto",
        }}
        className="flex items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50"
      >
        <div className="text-center text-gray-500">
          <Database className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">CMS Content List</p>
          <p className="text-xs">Configure content type in settings</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      {...getCommonProps(cmsElement)}
      {...eventHandlers}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        cursor: eventsActive ? "pointer" : "inherit",
        userSelect: eventsActive ? "none" : "auto",
      }}
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
            {cmsElement.elements && cmsElement.elements.length > 0 ? (
              // Use child elements as template
              <ElementLoader elements={cmsElement.elements} data={item} />
            ) : (
              // Default rendering
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
                        getFieldValue(item, "createdAt"),
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
