import type { EventHandler } from "@/features/eventworkflows/schema/eventSchemas";
import type { WorkflowData } from "@/features/eventworkflows/components/types/workflow.types";

export interface EventWorkflow {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  canvasData?: WorkflowData;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ElementEventWorkflowReference {
  [eventType: string]: string[];
}

export interface CreateEventWorkflowInput {
  handlers?: EventHandler[];
  name: string;
  description?: string;
  canvasData?: WorkflowData;
}

export interface UpdateEventWorkflowInput {
  handlers?: EventHandler[];
  name?: string;
  description?: string;
  canvasData?: WorkflowData;
  enabled?: boolean;
}

export interface WorkflowWithCanvas extends EventWorkflow {
  canvasData: WorkflowData;
}
