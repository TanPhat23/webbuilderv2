import type { ButtonElement, LinkElement } from "@/types/elements";

const protocols = new Set(["http:", "https:", "mailto:", "tel:"]);
const targets = new Set(["_self", "_blank", "_parent", "_top"]);

export function previewLinkProps(
  element: LinkElement | ButtonElement,
): { href: string; target: string | undefined; rel: string | undefined } | undefined {
  const href = typeof element.href === "string" ? element.href.trim() : "";
  if (!href) return undefined;
  try {
    if (!protocols.has(new URL(href, "https://preview.invalid/").protocol)) return undefined;
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
  return { href, target, rel: [...rel].join(" ") || undefined };
}
