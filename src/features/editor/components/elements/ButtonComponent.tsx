import React from "react";
import DOMPurify from "isomorphic-dompurify";
import { EditorComponentProps } from "@/features/editor";
import { useCanvasElement } from "./shared";

const ButtonComponent = ({ element }: EditorComponentProps) => {
  const { rootProps } = useCanvasElement(element);

  return (
    <button
      {...rootProps}
      type="button"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(element.content || ""),
      }}
    />
  );
};

export default ButtonComponent;
