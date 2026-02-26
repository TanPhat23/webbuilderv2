"use client";

import React from "react";
import DOMPurify from "isomorphic-dompurify";
import { ButtonElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";

interface PreviewButtonComponentProps {
  element: ButtonElement;
  data?: any;
}

const PreviewButtonComponent = ({ element }: PreviewButtonComponentProps) => {
  const safeStyles = elementHelper.getSafeStyles(element);

  return (
    <button
      type="button"
      className={element.tailwindStyles}
      style={safeStyles}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(element.content || "Button"),
      }}
    />
  );
};

export default PreviewButtonComponent;
