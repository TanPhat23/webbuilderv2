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

export function isEventOverElement(target: EventTarget | null): boolean {
  if (!target || typeof target !== "object" || !("closest" in target)) {
    return false;
  }
  const candidate = target.closest;
  if (typeof candidate !== "function") return false;
  return Boolean(Reflect.apply(candidate, target, ["[data-element-id]"]));
}
