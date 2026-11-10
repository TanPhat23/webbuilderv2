export const eventWorkflowKeys = {
  all: ["eventWorkflows"] as const,
  lists: () => [...eventWorkflowKeys.all, "list"] as const,
  list: (projectId: string) =>
    [...eventWorkflowKeys.lists(), projectId] as const,
  details: () => [...eventWorkflowKeys.all, "detail"] as const,
  detail: (workflowId: string) =>
    [...eventWorkflowKeys.details(), workflowId] as const,
};
