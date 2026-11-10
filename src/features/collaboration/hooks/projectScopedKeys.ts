export function projectScopedKeys<Root extends string>(root: Root) {
  const all = [root] as const;
  const lists = () => [...all, "list"] as const;
  return {
    all,
    lists,
    list: (filters?: Record<string, unknown>) => [...lists(), filters] as const,
    byProject: (projectId: string) => [...all, "project", projectId] as const,
  };
}
