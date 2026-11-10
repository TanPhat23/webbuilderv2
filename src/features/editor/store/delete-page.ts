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
