import React from "react";
import type { ButtonElement } from "@/features/editor/interfaces/elements.interface";
import { previewLinkProps } from "@/features/preview/lib/link-props";
import { sanitizeTextContent } from "./TextView";
import type { ViewProps } from "../view-props";

export default function ButtonView({ element, rootProps }: ViewProps<ButtonElement>) {
  const link = previewLinkProps(element);
  const Tag = link ? "a" : "button";
  return <Tag {...rootProps} type={link ? undefined : "button"} {...link}
    dangerouslySetInnerHTML={{ __html: sanitizeTextContent(element.content ?? "Button") }} />;
}
