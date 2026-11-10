
import React, { Suspense } from "react";
import { EditorElement } from "@/types/global.type";
import { EditorComponentProps } from "@/features/editor";
import { getComponentFactory } from "@/features/editor";

interface ElementRendererProps {
  element: EditorElement;
  data?: Record<string, unknown>;
}

// Components load after mount, so the first render does not include the element.
const ElementRenderer: React.FC<ElementRendererProps> = ({ element, data }) => {
  const commonProps: EditorComponentProps = {
    element,
    data,
  };

  const componentFactory = getComponentFactory(element.type);
  const [Component, setComponent] =
    React.useState<React.ComponentType<EditorComponentProps> | null>(null);

  React.useEffect(() => {
    if (componentFactory) {
      componentFactory()
        .then((comp) => setComponent(() => comp))
        .catch((err) => {
          console.error(
            `Failed to load component for type "${element.type}":`,
            err,
          );
        });
    }
  }, [element.type, componentFactory]);

  if (!Component) {
    return null;
  }

  return <Component {...commonProps} />;
};

export default React.memo(
  ElementRenderer,
  (prev, next) => prev.element === next.element && prev.data === next.data,
);
