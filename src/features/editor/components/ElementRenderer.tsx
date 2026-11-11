import React, { Suspense } from "react";
import type { EditorElement, ElementType } from "@/types/global.type";
import { EditorComponentProps, getComponentFactory } from "@/features/editor";

interface ElementRendererProps {
  element: EditorElement;
  data?: Record<string, unknown>;
}

type LazyElementComponent = React.LazyExoticComponent<
  React.ComponentType<EditorComponentProps>
>;

const NullComponent: React.FC<EditorComponentProps> = () => null;

// One lazy component per element type, shared by every instance, so each
// type's chunk is requested once and later renders are synchronous.
const lazyComponents = new Map<ElementType, LazyElementComponent | null>();

function getLazyComponent(type: ElementType): LazyElementComponent | null {
  if (!lazyComponents.has(type)) {
    const factory = getComponentFactory(type);
    lazyComponents.set(
      type,
      factory
        ? React.lazy(() =>
            factory()
              .then((component) => ({ default: component }))
              .catch((err) => {
                console.error(`Failed to load component for type "${type}":`, err);
                return { default: NullComponent };
              }),
          )
        : null,
    );
  }
  return lazyComponents.get(type) ?? null;
}

const ElementRenderer: React.FC<ElementRendererProps> = ({ element, data }) => {
  const Component = getLazyComponent(element.type);
  if (!Component) return null;

  return (
    <Suspense fallback={null}>
      <Component element={element} data={data} />
    </Suspense>
  );
};

export default React.memo(
  ElementRenderer,
  (prev, next) => prev.element === next.element && prev.data === next.data,
);
