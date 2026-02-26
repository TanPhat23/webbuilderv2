import React from "react";
import { ListElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import PreviewElementLoader from "./PreviewElementLoader";

interface PreviewListComponentProps {
  element: ListElement;
  data?: any;
}

const PreviewListComponent = ({ element, data }: PreviewListComponentProps) => {
  const safeStyles = elementHelper.getSafeStyles(element);

  // If data is an array, render each item using child elements as template
  const itemsToRender = Array.isArray(data) ? data : element.elements || [];

  if (Array.isArray(data)) {
    return (
      <ul className={element.tailwindStyles} style={safeStyles}>
        {data.map((item, index) => (
          <li key={index}>
            <PreviewElementLoader elements={element.elements} data={item} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={element.tailwindStyles} style={safeStyles}>
      <PreviewElementLoader elements={element.elements} data={data} />
    </ul>
  );
};

export default PreviewListComponent;
