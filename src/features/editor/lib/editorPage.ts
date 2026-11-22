import type { Page } from "@/features/pages";

export function resolveFallbackPage(
  pages: readonly Page[] | undefined,
  requestedPageId: string,
): Page | undefined {
  if (!pages || pages.length === 0) return undefined;
  if (requestedPageId) {
    const active = pages.find((page) => page.Id === requestedPageId && !page.DeletedAt);
    if (active) return undefined;
  }

  const routes = pages.filter((page) => page.Type !== "cp" && !page.DeletedAt);
  return routes.find((page) => page.Name === "") ?? routes[0];
}

function hasClosest(target: EventTarget | null): target is Element {
  return (
    target !== null &&
    typeof target === "object" &&
    "closest" in target &&
    typeof target.closest === "function"
  );
}

export function isEventOverElement(target: EventTarget | null): boolean {
  return hasClosest(target) ? Boolean(target.closest("[data-element-id]")) : false;
}
