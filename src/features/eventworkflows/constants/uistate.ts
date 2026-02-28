import type { WorkflowData } from "@/features/eventworkflows/components/types/workflow.types";

export const WORKFLOW_MANAGER_VIEWS = {
  LIST: "list",
  CREATE: "create",
  EDIT: "edit",
} as const;

export type WorkflowManagerViewType =
  (typeof WORKFLOW_MANAGER_VIEWS)[keyof typeof WORKFLOW_MANAGER_VIEWS];

export type WorkflowManagerView =
  | { type: "list" }
  | { type: "create" }
  | {
      type: "edit";
      workflowId: string;
      workflowName: string;
      initialData?: WorkflowData;
    };
