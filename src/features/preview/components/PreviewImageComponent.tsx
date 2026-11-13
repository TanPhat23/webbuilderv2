import React from "react";
import { ImageElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";

interface PreviewImageComponentProps {
  element: ImageElement;
  data?: any;
}

const PreviewImageComponent = ({ element }: PreviewImageComponentProps) => {
  const safeStyles = elementHelper.getSafeStyles(element);

  return (
    <img
      src={element.src || ""}
      alt={element.content || "Image"}
      id={element.id} data-element-id={element.id} className={element.tailwindStyles}
      style={{
        ...safeStyles,
        objectFit: "cover",
      }}
    />
  );
};

export default PreviewImageComponent;
