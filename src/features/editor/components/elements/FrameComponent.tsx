import React from "react";
import { useElementHandler } from "@/hooks";
import { EditorComponentProps } from "@/features/editor";
import { FrameElement } from "@/features/editor";
import ElementLoader from "../ElementLoader";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useEditorElement, eventsStyle } from "./shared";

const FrameComponent = ({ element, data }: EditorComponentProps) => {
  const frameElement = element as FrameElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(frameElement);

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      {...getCommonProps(frameElement)}
      {...eventHandlers}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive),
      }}
    >
      <ElementLoader elements={frameElement.elements} data={data} />
    </div>
  );
};

export default FrameComponent;
