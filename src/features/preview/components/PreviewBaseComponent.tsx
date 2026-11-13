import React from "react";
import DOMPurify from "isomorphic-dompurify";
import { TextElement } from "@/features/editor";
import { resolveContent } from "@/features/editor/utils/element/resolveContent";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";

interface PreviewBaseComponentProps {
  element: TextElement;
  data?: any;
}

const PreviewBaseComponent = ({ element, data }: PreviewBaseComponentProps) => {
  const safeStyles = elementHelper.getSafeStyles(element);

  const content = resolveContent(element, data, false);

  return (
    <div
      id={element.id} data-element-id={element.id} className={element.tailwindStyles}
      style={safeStyles}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(content),
      }}
    ></div>
  );
};

export default PreviewBaseComponent;
