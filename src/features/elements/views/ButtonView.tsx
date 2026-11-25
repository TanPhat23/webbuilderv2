import React from "react";
import type { ButtonElement } from "@/types/elements";
import { useSiteNavigationOptional } from "@/features/elements/context/SiteNavigationContext";
import { previewLinkProps } from "../lib/link-props";
import { sanitizeTextContent } from "./TextView";
import type { ViewProps } from "../view-props";

export default function ButtonView({ element, rootProps, data, mode }: ViewProps<ButtonElement>) {
  const siteNav = useSiteNavigationOptional();
  const link = previewLinkProps(element, mode === "preview" ? siteNav : null, data);
  const Tag = link ? "a" : "button";
  return <Tag {...rootProps} type={link ? undefined : "button"} {...link}
    dangerouslySetInnerHTML={{ __html: sanitizeTextContent(element.content ?? "Button") }} />;
}
