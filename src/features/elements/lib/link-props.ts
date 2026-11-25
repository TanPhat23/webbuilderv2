import type React from "react";
import type { ButtonElement, LinkElement } from "@/types/elements";
import type { SiteNavigationContextValue } from "@/features/elements/context/SiteNavigationContext";
import { interpolateHref, resolveSiteHref } from "@/lib/site-routing";

const protocols = new Set(["http:", "https:", "mailto:", "tel:"]);
const targets = new Set(["_self", "_blank", "_parent", "_top"]);

export interface PreviewLinkProps {
  readonly href: string;
  readonly target: string | undefined;
  readonly rel: string | undefined;
  readonly onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export function previewLinkProps(
  element: LinkElement | ButtonElement,
  siteNav?: SiteNavigationContextValue | null,
  data?: Record<string, unknown>,
): PreviewLinkProps | undefined {
  const uninterpolated = typeof element.href === "string" ? element.href.trim() : "";
  if (!uninterpolated) return undefined;
  const rawHref = interpolateHref(uninterpolated, data, siteNav?.params);
  try {
    if (!protocols.has(new URL(rawHref, "https://preview.invalid/").protocol)) return undefined;
  } catch {
    return undefined;
  }

  const settings = element.settings;
  const target = typeof settings?.target === "string" && targets.has(settings.target)
    ? settings.target
    : undefined;
  const rel = new Set(typeof settings?.rel === "string" ? settings.rel.split(/\s+/).filter(Boolean) : []);
  if (settings?.nofollow === true) rel.add("nofollow");
  if (settings?.noreferrer === true) rel.add("noreferrer");
  if (settings?.noopener === true || target === "_blank") {
    rel.delete("opener");
    rel.add("noopener");
  }
  const relValue = [...rel].join(" ") || undefined;

  if (!siteNav) {
    return { href: rawHref, target, rel: relValue };
  }

  const resolved = resolveSiteHref(rawHref, {
    mode: siteNav.mode,
    pages: siteNav.pages,
  });
  if (!resolved) {
    return { href: rawHref, target, rel: relValue };
  }

  const canSpaNavigate =
    resolved.kind === "internal" && (!target || target === "_self");

  if (!canSpaNavigate) {
    return { href: resolved.href, target, rel: relValue };
  }

  return {
    href: resolved.href,
    target,
    rel: relValue,
    onClick: (event: React.MouseEvent<HTMLAnchorElement>): void => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }
      event.preventDefault();
      siteNav.navigate(rawHref);
    },
  };
}
