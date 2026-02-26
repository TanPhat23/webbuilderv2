import React from "react";
import DOMPurify from "isomorphic-dompurify";
import { TextElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";

interface PreviewBaseComponentProps {
  element: TextElement;
  data?: any;
}

const PreviewBaseComponent = ({ element, data }: PreviewBaseComponentProps) => {
  const safeStyles = elementHelper.getSafeStyles(element);

  let content =
    (typeof data === "string" ? data : "") ||
    (typeof data === "object" && data && typeof data.content === "string"
      ? data.content
      : "") ||
    (typeof element.content === "string" ? element.content : "") ||
    "";

  if (typeof element.content === "string" && data && typeof data === "object") {
    content = elementHelper.replacePlaceholders(element.content, data);
  }

  return (
    <div
      className={element.tailwindStyles}
      style={safeStyles}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(content),
      }}
    ></div>
  );
};

export default PreviewBaseComponent;
