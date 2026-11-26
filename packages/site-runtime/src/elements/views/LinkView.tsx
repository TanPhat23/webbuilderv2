import React from "react";
import type { LinkElement } from "../../types/elements";
import { useSiteNavigationOptional } from "../context/SiteNavigationContext";
import { resolveContent } from "../lib/resolveContent";
import { previewLinkProps } from "../lib/link-props";
import { sanitizeTextContent } from "./TextView";
import type { ViewProps } from "../view-props";

interface LinkViewProps extends ViewProps<LinkElement> {
  labelProps?: React.HTMLAttributes<HTMLElement>;
}

export default function LinkView({
  element,
  rootProps,
  children,
  data,
  labelProps,
  mode,
}: LinkViewProps): React.JSX.Element {
  const siteNav = useSiteNavigationOptional();
  const link = previewLinkProps(
    element,
    mode === "preview" ? siteNav : null,
    data,
  );
  const html = {
    __html: sanitizeTextContent(resolveContent(element, data, false)),
  };

  if (link) {
    return children == null ? (
      <a {...rootProps} {...link} dangerouslySetInnerHTML={html} />
    ) : (
      <a {...rootProps} {...link}>
        {(html.__html || labelProps) && (
          <span {...labelProps} dangerouslySetInnerHTML={html} />
        )}
        {children}
      </a>
    );
  }

  return children == null ? (
    <div {...rootProps} dangerouslySetInnerHTML={html} />
  ) : (
    <div {...rootProps}>
      {(html.__html || labelProps) && (
        <span {...labelProps} dangerouslySetInnerHTML={html} />
      )}
      {children}
    </div>
  );
}
