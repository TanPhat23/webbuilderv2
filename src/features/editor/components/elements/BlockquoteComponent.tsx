import React from "react";
import {
  EditorComponentProps,
  BlockquoteElement,
  BlockquoteSettings,
} from "@/features/editor";
import { TextElementShell } from "./shared";

const BlockquoteComponent = ({ element, data }: EditorComponentProps) => {
  const blockquoteElement = element as BlockquoteElement;
  const settings = (blockquoteElement.settings ?? {}) as BlockquoteSettings;
  const cite = settings.cite;

  return (
    <TextElementShell
      element={element}
      data={data}
      as="blockquote"
      elementProps={{ cite: cite || undefined }}
    />
  );
};

export default BlockquoteComponent;
