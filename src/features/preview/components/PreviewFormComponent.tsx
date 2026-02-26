import React from "react";
import { FormElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import PreviewElementLoader from "./PreviewElementLoader";

interface PreviewFormComponentProps {
  element: FormElement;
  data?: any;
}

const PreviewFormComponent = ({ element, data }: PreviewFormComponentProps) => {
  const safeStyles = elementHelper.getSafeStyles(element);
  const settings = element.settings || {};

  return (
    <form
      action={settings.action}
      method={settings.method || "post"}
      target={settings.target}
      encType={settings.encType}
      acceptCharset={settings.acceptCharset}
      className={element.tailwindStyles}
      style={safeStyles}
    >
      <PreviewElementLoader elements={element.elements} data={data} />
    </form>
  );
};

export default PreviewFormComponent;
