import { EditorElement } from "@/types/global.type";
import React from "react";
import { getPreviewComponentMap } from "@/features/preview";

interface PreviewElementLoaderProps {
  elements?: EditorElement[];
  data?: Record<string, unknown>;
}

export default function PreviewElementLoader({
  elements,
  data,
}: PreviewElementLoaderProps = {}) {
  const renderElement = (element: EditorElement) => {
    const Component = getPreviewComponentMap(element.type);
    return Component ? (
      <Component key={element.id} element={element} data={data} />
    ) : null;
  };

  return <>{elements?.map((element) => renderElement(element))}</>;
}
