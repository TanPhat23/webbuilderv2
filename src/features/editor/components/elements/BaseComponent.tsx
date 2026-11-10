import React from "react";
import { EditorComponentProps } from "@/features/editor";
import { TextElementShell } from "./shared";

const BaseComponent = ({ element, data }: EditorComponentProps) => {
  return <TextElementShell element={element} data={data} as="div" />;
};

export default BaseComponent;
