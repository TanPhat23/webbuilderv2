import React from "react";
import type { EditorElement } from "@/types/global.type";
import type { ViewProps } from "../view-props";

const tags = { Section: "section", Header: "header", Footer: "footer", Nav: "nav", Article: "article", Aside: "aside" } as const;
type Section = Extract<EditorElement, { type: keyof typeof tags }>;

export default function SectionView({ element, rootProps, children }: ViewProps<Section>) {
  const Tag = tags[element.type];
  return <Tag {...rootProps}>{children}</Tag>;
}
