import React from "react";
import type { ButtonElement } from "../../types/elements";
import { useSiteNavigationOptional } from "../context/SiteNavigationContext";
import { buildSiteHref } from "../../lib/site-routing";
import { previewLinkProps } from "../lib/link-props";
import { resolveContent } from "../lib/resolveContent";
import { sanitizeTextContent } from "./TextView";
import type { ViewProps } from "../view-props";

export default function ButtonView({ element, rootProps, data, mode }: ViewProps<ButtonElement>) {
  const siteNav = useSiteNavigationOptional();
  const isLogoutButton =
    mode === "preview" && element.settings?.authAction === "logout";
  const link = isLogoutButton
    ? undefined
    : previewLinkProps(element, mode === "preview" ? siteNav : null, data);
  const label = resolveContent(element, data, false) || "Button";
  const html = { __html: sanitizeTextContent(label) };

  if (link) {
    return <a {...rootProps} {...link} dangerouslySetInnerHTML={html} />;
  }

  const buttonType = element.settings?.buttonType ?? "button";
  const handleLogoutClick = isLogoutButton
    ? async (): Promise<void> => {
        const projectId = siteNav?.projectId;
        if (!projectId) return;
        await fetch("/api/site-auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
        const targetHref = element.href?.trim()
          ? siteNav
            ? buildSiteHref(siteNav.mode, element.href.trim())
            : element.href.trim()
          : siteNav
            ? buildSiteHref(siteNav.mode, "/")
            : "/";
        window.location.assign(targetHref);
      }
    : undefined;

  return (
    <button
      {...rootProps}
      type={buttonType}
      onClick={
        handleLogoutClick
          ? (e) => {
              rootProps.onClick?.(e);
              void handleLogoutClick();
            }
          : rootProps.onClick
      }
      dangerouslySetInnerHTML={html}
    />
  );
}
