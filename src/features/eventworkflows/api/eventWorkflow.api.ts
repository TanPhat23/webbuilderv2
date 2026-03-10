import { createServerFn } from "@tanstack/react-start";
import { eventWorkflowService } from "@/features/eventworkflows/services/eventWorkflow.service";
import type {
  CreateEventWorkflowInput,
  UpdateEventWorkflowInput,
} from "@/features/eventworkflows";
import {
  CreateEventWorkflowSchema,
  UpdateEventWorkflowSchema,
} from "@/features/eventworkflows/schema/eventWorkflow";
import z from "zod";
import { getAuthToken } from "@/features/auth/lib/gettoken";

const WorkflowIdSchema = z.object({
  workflowId: z.string().min(1, "Workflow ID is required"),
});

const ProjectIdSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
});

const CreateWorkflowRequestSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  input: CreateEventWorkflowSchema.extend({
    handlers: z.array(z.unknown()).optional(),
  }),
});

const UpdateWorkflowRequestSchema = z.object({
  workflowId: z.string().min(1, "Workflow ID is required"),
  input: UpdateEventWorkflowSchema,
});

const UpdateWorkflowEnabledRequestSchema = z.object({
  workflowId: z.string().min(1, "Workflow ID is required"),
  enabled: z.boolean(),
});

type WorkflowIdInput = z.infer<typeof WorkflowIdSchema>;
type ProjectIdInput = z.infer<typeof ProjectIdSchema>;
type CreateWorkflowRequest = z.infer<typeof CreateWorkflowRequestSchema>;
type UpdateWorkflowRequest = z.infer<typeof UpdateWorkflowRequestSchema>;
type UpdateWorkflowEnabledRequest = z.infer<
  typeof UpdateWorkflowEnabledRequestSchema
>;

export const getEventWorkflows = createServerFn({ method: "GET" })
  .inputValidator((data: ProjectIdInput) => ProjectIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    return eventWorkflowService.getEventWorkflows(data.projectId, token);
  });

export const getEventWorkflowById = createServerFn({ method: "GET" })
  .inputValidator((data: WorkflowIdInput) => WorkflowIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    return eventWorkflowService.getEventWorkflowById(data.workflowId, token);
  });

export const createEventWorkflow = createServerFn({ method: "POST" })
  .inputValidator((data: CreateWorkflowRequest) =>
    CreateWorkflowRequestSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();

    const input: CreateEventWorkflowInput = {
      name: data.input.name,
      description: data.input.description,
      handlers: data.input.handlers ?? [],
    };

    return eventWorkflowService.createEventWorkflow(
      data.projectId,
      input,
      token,
    );
  });

export const updateEventWorkflow = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateWorkflowRequest) =>
    UpdateWorkflowRequestSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();

    const input: UpdateEventWorkflowInput = {
      name: data.input.name,
      description: data.input.description,
      enabled: data.input.enabled,
    };

    return eventWorkflowService.updateEventWorkflow(
      data.workflowId,
      input,
      token,
    );
  });

export const updateEventWorkflowEnabled = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateWorkflowEnabledRequest) =>
    UpdateWorkflowEnabledRequestSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    return eventWorkflowService.updateEventWorkflowEnabled(
      data.workflowId,
      data.enabled,
      token,
    );
  });

export const deleteEventWorkflow = createServerFn({ method: "POST" })
  .inputValidator((data: WorkflowIdInput) => WorkflowIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    await eventWorkflowService.deleteEventWorkflow(data.workflowId, token);
    return { success: true };
  });
