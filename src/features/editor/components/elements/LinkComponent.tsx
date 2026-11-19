import React from "react";
import type { EditorComponentProps } from "@/features/editor/interfaces/editor.interface";
import LinkView from "@/features/elements/views/LinkView";
import { getViewChildren } from "@/features/elements/element-children";
import ElementLoader from "../ElementLoader";
import { useCanvasElement } from "./shared/useCanvasElement";

export default function LinkComponent({ element, data }: EditorComponentProps) {
  const { rootProps, isEditing } = useCanvasElement(element);
  if (element.type !== "Link") return null;
  const elements = getViewChildren(element);
  const { onBlur, contentEditable } = rootProps;
  const editLabel = isEditing && !!elements?.length;
  const preventNavigation = (event: React.MouseEvent<HTMLElement>) => {
    if (event.currentTarget.tagName === "A") event.preventDefault();
  };
  return (
    <LinkView element={element} mode="edit" data={isEditing ? undefined : data}
      rootProps={{
        ...rootProps,
        onClick: preventNavigation,
        onAuxClick: preventNavigation,
        ...(editLabel && { onBlur: undefined, contentEditable: undefined }),
      }}
      labelProps={editLabel ? { onBlur, contentEditable, suppressContentEditableWarning: true } : undefined}>
      {elements?.length ? <ElementLoader elements={elements} data={data} /> : undefined}
    </LinkView>
  );
}
