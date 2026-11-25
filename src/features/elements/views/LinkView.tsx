import React from "react";
import type { LinkElement } from "@/types/elements";
import { useSiteNavigationOptional } from "@/features/elements/context/SiteNavigationContext";
import { resolveContent } from "../lib/resolveContent";
import { previewLinkProps } from "../lib/link-props";
import { sanitizeTextContent } from "./TextView";
import type { ViewProps } from "../view-props";

interface LinkViewProps extends ViewProps<LinkElement> {
  labelProps?: React.HTMLAttributes<HTMLElement>;
}

export default function LinkView({ element, rootProps, children, data, labelProps, mode }: LinkViewProps) {
  const siteNav = useSiteNavigationOptional();
  const link = previewLinkProps(element, mode === "preview" ? siteNav : null, data);
  const Tag = link ? "a" : "div";
  const html = { __html: sanitizeTextContent(resolveContent(element, data, false)) };

  return children == null ? (
    <Tag {...rootProps} {...link} dangerouslySetInnerHTML={html} />
  ) : (
    <Tag {...rootProps} {...link}>
      {(html.__html || labelProps) && <span {...labelProps} dangerouslySetInnerHTML={html} />}
      {children}
    </Tag>
  );
}
