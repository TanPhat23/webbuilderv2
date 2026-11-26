import type { EditorElement } from "@/types/global.type";
import React, { createContext, useContext } from "react";
import { getView } from "@/features/elements/registry";
import { getViewChildren } from "@/features/elements/element-children";
import { elementUtils } from "@/features/elements/lib/elementhelper";
import { isMissingComponent } from "@/features/projects/lib/components";
import { useSiteNavigationOptional } from "@/features/elements/context/SiteNavigationContext";
import {
  readElementAuthVisibility,
  shouldRenderForAuthVisibility,
} from "@/lib/site-auth";
import { PreviewCMSCollection, PreviewCMSItem } from "./PreviewCMSContent";

const MissingComponentContext = createContext(false);

interface PreviewElementLoaderProps {
  elements?: EditorElement[];
  showMissing?: boolean;
  /** Used by the canvas to drag an instance by its rendered roots. */
  draggableRoot?: boolean;
  data?: Record<string, unknown>;
}

function PreviewElement({ element, data, draggableRoot }: {
  element: EditorElement;
  data?: Record<string, unknown>;
  draggableRoot?: boolean;
}) {
  const showMissing = useContext(MissingComponentContext);
  const siteNav = useSiteNavigationOptional();
  if (
    siteNav &&
    !shouldRenderForAuthVisibility(
      readElementAuthVisibility(element.settings),
      Boolean(siteNav.user),
    )
  ) {
    return null;
  }
  if (isMissingComponent(element)) {
    return showMissing ? <div data-element-id={element.id} draggable={draggableRoot} className="min-h-10 rounded border border-dashed border-border bg-muted px-2 py-1.5 text-xs text-muted-foreground">Missing component</div> : null;
  }

  const View = getView(element.type);
  if (!View) return null;
  const rootProps = {
    id: element.id,
    "data-element-id": element.id,
    className: element.tailwindStyles,
    style: elementUtils.getSafeStyles(element),
    draggable: draggableRoot,
  };
  const props = { rootProps, mode: "preview" as const };

  const renderElements = (
    nestedElements: EditorElement[],
    nestedData?: Record<string, unknown>,
  ) => <PreviewElementLoader elements={nestedElements} data={nestedData} />;

  if (element.type === "CMSContentList" || element.type === "CMSContentGrid") {
    return <PreviewCMSCollection {...props} element={element} renderElements={renderElements} />;
  }
  if (element.type === "CMSContentItem") {
    return <PreviewCMSItem {...props} element={element} renderElements={renderElements} />;
  }

  const elements = getViewChildren(element);
  let children: React.ReactNode;
  if (element.type === "Carousel") {
    children = elements?.map((slide, index) => (
      <PreviewElementLoader key={slide.id || index} elements={[slide]} data={data} />
    ));
  } else if (element.type === "List" && Array.isArray(data)) {
    children = data.map((item, index) => (
      <PreviewElementLoader key={index} elements={elements} data={item} />
    ));
  } else if (elements?.length) {
    children = <PreviewElementLoader elements={elements} data={data} />;
  }

  return <View {...props} element={element} data={data}>{children}</View>;
}

export default function PreviewElementLoader({ elements, data, showMissing, draggableRoot }: PreviewElementLoaderProps) {
  const content = elements?.map((element) => <PreviewElement key={element.id} element={element} data={data} draggableRoot={draggableRoot} />);
  return showMissing === undefined ? <>{content}</> : (
    <MissingComponentContext.Provider value={showMissing}>{content}</MissingComponentContext.Provider>
  );
}
