import React from "react";
import {
  EditorComponentProps,
  HeadingElement,
  HeadingSettings,
} from "@/features/editor";
import { TextElementShell } from "./shared";

const HeadingComponent = ({ element, data }: EditorComponentProps) => {
  const headingElement = element as HeadingElement;
  const settings = (headingElement.settings ?? { level: 2 }) as HeadingSettings;
  const level = settings.level ?? 2;
  const Tag = `h${level}` as const;

  return <TextElementShell element={element} data={data} as={Tag} />;
};

export default HeadingComponent;
