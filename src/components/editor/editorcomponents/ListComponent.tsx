import React from "react";
import { useElementHandler } from "@/hooks";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { ListElement } from "@/interfaces/elements.interface";
import { LayoutGroup } from "framer-motion";
import ElementLoader from "../ElementLoader";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { useEditorElement, eventsStyle } from "./shared";

const ListComponent = ({ element, data }: EditorComponentProps) => {
  const listElement = element as ListElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(listElement);

  const itemsToRender = Array.isArray(data) ? data : listElement.elements || [];

  return (
    <ul
      ref={elementRef as React.RefObject<HTMLUListElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      {...getCommonProps(listElement)}
      {...eventHandlers}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive),
      }}
    >
      <LayoutGroup>
        {itemsToRender.map((item, index) => (
          <li key={index} className="list-item">
            {Array.isArray(data) ? (
              <ElementLoader elements={listElement.elements} data={item} />
            ) : (
              <ElementLoader elements={[item]} />
            )}
          </li>
        ))}
      </LayoutGroup>
    </ul>
  );
};

export default ListComponent;
