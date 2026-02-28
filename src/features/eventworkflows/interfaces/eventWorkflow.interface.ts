import { EventHandler } from "@/features/eventworkflows/schema/eventSchemas";
import {
  WorkflowData,
  WorkflowNode,
  Connection,
} from "@/features/eventworkflows/components/types/workflow.types";

export interface EventWorkflow {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  canvasData?: WorkflowData; // Stores nodes, connections, and metadata
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ElementEventWorkflowReference {
  [eventType: string]: string[];
}

export interface CreateEventWorkflowInput {
  name: string;
  description?: string;
  canvasData?: WorkflowData;
}

export interface UpdateEventWorkflowInput {
  name?: string;
  description?: string;
  canvasData?: WorkflowData;
  enabled?: boolean;
}

// Workflow with full canvas data for editing
export interface WorkflowWithCanvas extends EventWorkflow {
  canvasData: WorkflowData;
}
