import React from "react";
import { SelectElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";

interface PreviewSelectComponentProps {
  element: SelectElement;
  data?: any;
}

const PreviewSelectComponent = ({ element }: PreviewSelectComponentProps) => {
  const safeStyles = elementHelper.getSafeStyles(element);

  return (
    <select className={element.tailwindStyles} style={safeStyles}>
      <option value="">{element.content || "Select an option"}</option>
      {element.elements?.map((option, index) => (
        <option key={index} value={option.content || ""}>
          {option.content || `Option ${index + 1}`}
        </option>
      ))}
    </select>
  );
};

export default PreviewSelectComponent;
