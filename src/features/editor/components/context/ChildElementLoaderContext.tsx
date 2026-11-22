import React, { createContext, useContext } from "react";
import type { EditorElement } from "@/types/global.type";

type ChildElementsRenderer = (
  elements: EditorElement[],
  data?: Record<string, unknown>,
) => React.ReactNode;

const ChildElementLoaderContext = createContext<ChildElementsRenderer | null>(
  null,
);

export function ChildElementLoaderProvider({
  renderElements,
  children,
}: {
  renderElements: ChildElementsRenderer;
  children: React.ReactNode;
}) {
  return (
    <ChildElementLoaderContext.Provider value={renderElements}>
      {children}
    </ChildElementLoaderContext.Provider>
  );
}

export function ChildElements({
  elements,
  data,
}: {
  elements?: EditorElement[];
  data?: Record<string, unknown>;
}) {
  const renderElements = useContext(ChildElementLoaderContext);
  if (!renderElements || !elements?.length) return null;
  return <>{renderElements(elements, data)}</>;
}
