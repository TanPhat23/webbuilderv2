export async function deletePageFromList<T extends { Id: string; ProjectId: string }>(
  pages: T[],
  pageId: string,
  remove: (projectId: string, pageId: string) => Promise<void>,
): Promise<T[]> {
  const page = pages.find((item) => item.Id === pageId);
  if (!page) return pages;
  await remove(page.ProjectId, page.Id);
  return pages.filter((item) => item.Id !== page.Id);
}

export function pageAfterDeletion<T extends { Id: string }>(current: T | null, deletedId: string, remaining: T[]): T | null {
  return current?.Id === deletedId ? remaining[0] ?? null : current;
}

export async function deletePageFromCache<T extends { Id: string }>(
  client: import('@tanstack/react-query').QueryClient,
  queryKey: readonly unknown[],
  projectId: string,
  pageId: string,
  remove: (projectId: string, pageId: string) => Promise<void>,
  fallback: T[] = [],
): Promise<T[]> {
  await remove(projectId, pageId);
  await client.cancelQueries({ queryKey, exact: true });
  const remaining = (client.getQueryData<T[]>(queryKey) ?? fallback).filter((page) => page.Id !== pageId);
  client.setQueryData(queryKey, remaining);
  return remaining;
}
