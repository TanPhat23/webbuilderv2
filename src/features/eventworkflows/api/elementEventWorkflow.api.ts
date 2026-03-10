import { createServerFn } from "@tanstack/react-start";
import z from "zod";

import {
  elementEventWorkflowService,
  type CreateElementEventWorkflowInput,
  type IElementEventWorkflow,
  type UpdateElementEventWorkflowInput,
} from "@/features/eventworkflows";
import {
  CreateElementEventWorkflowSchema,
  DisconnectElementEventWorkflowSchema,
  ElementIdSchema,
  UpdateElementEventWorkflowSchema,
} from "@/features/eventworkflows/schema/elementEventWorkflowSchemas";
import { getAuthToken } from "@/features/auth/lib/gettoken";

const ConnectionIdSchema = z.object({
  id: z.string().min(1, "Connection ID is required"),
});

const PageIdSchema = z.object({
  pageId: z.string().min(1, "Page ID is required"),
});

const CreateConnectionRequestSchema = CreateElementEventWorkflowSchema;
const DeleteByElementRequestSchema = z.object({
  elementId: ElementIdSchema,
});
const DeleteByWorkflowRequestSchema = z.object({
  workflowId: z.string().min(1, "Workflow ID is required"),
});
const UpdateConnectionRequestSchema = z.object({
  id: z.string().min(1, "Connection ID is required"),
  input: UpdateElementEventWorkflowSchema,
});

type ConnectionIdInput = z.infer<typeof ConnectionIdSchema>;
type PageIdInput = z.infer<typeof PageIdSchema>;
type CreateConnectionRequest = z.infer<typeof CreateConnectionRequestSchema>;
type DeleteByElementRequest = z.infer<typeof DeleteByElementRequestSchema>;
type DeleteByWorkflowRequest = z.infer<typeof DeleteByWorkflowRequestSchema>;
type UpdateConnectionRequest = z.infer<typeof UpdateConnectionRequestSchema>;
type DisconnectConnectionRequest = z.infer<
  typeof DisconnectElementEventWorkflowSchema
>;



export const createElementEventWorkflow = createServerFn({ method: "POST" })
  .inputValidator((data: CreateConnectionRequest) =>
    CreateConnectionRequestSchema.parse(data),
  )
  .handler(async ({ data }): Promise<IElementEventWorkflow> => {
    const { token } = await getAuthToken();

    const input: CreateElementEventWorkflowInput = {
      elementId: data.elementId,
      workflowId: data.workflowId,
      eventName: data.eventName,
    };

    return elementEventWorkflowService.createElementEventWorkflow(input, token);
  });

export const getElementEventWorkflows = createServerFn({
  method: "GET",
}).handler(async (): Promise<IElementEventWorkflow[]> => {
  const { token } = await getAuthToken();
  return elementEventWorkflowService.getElementEventWorkflows(token);
});

export const getElementEventWorkflowsByElement = createServerFn({
  method: "GET",
})
  .inputValidator((data: DeleteByElementRequest) =>
    DeleteByElementRequestSchema.parse(data),
  )
  .handler(async ({ data }): Promise<IElementEventWorkflow[]> => {
    const { token } = await getAuthToken();
    return elementEventWorkflowService.getElementEventWorkflowsByElement(
      data.elementId,
      token,
    );
  });

export const getElementEventWorkflowsByPage = createServerFn({ method: "GET" })
  .inputValidator((data: PageIdInput) => PageIdSchema.parse(data))
  .handler(async ({ data }): Promise<IElementEventWorkflow[]> => {
    const { token } = await getAuthToken();
    return elementEventWorkflowService.getElementEventWorkflowsByPage(
      data.pageId,
      token,
    );
  });

export const getElementEventWorkflowById = createServerFn({ method: "GET" })
  .inputValidator((data: ConnectionIdInput) => ConnectionIdSchema.parse(data))
  .handler(async ({ data }): Promise<IElementEventWorkflow> => {
    const { token } = await getAuthToken();
    return elementEventWorkflowService.getElementEventWorkflowByID(
      data.id,
      token,
    );
  });

export const updateElementEventWorkflow = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateConnectionRequest) =>
    UpdateConnectionRequestSchema.parse(data),
  )
  .handler(async ({ data }): Promise<IElementEventWorkflow> => {
    const { token } = await getAuthToken();

    const input: UpdateElementEventWorkflowInput = {
      eventName: data.input.eventName,
      workflowId: data.input.workflowId,
    };

    return elementEventWorkflowService.updateElementEventWorkflow(
      data.id,
      input,
      token,
    );
  });

export const deleteElementEventWorkflow = createServerFn({ method: "POST" })
  .inputValidator((data: ConnectionIdInput) => ConnectionIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    await elementEventWorkflowService.deleteElementEventWorkflow(
      data.id,
      token,
    );
    return { success: true };
  });

export const deleteElementEventWorkflowsByElement = createServerFn({
  method: "POST",
})
  .inputValidator((data: DeleteByElementRequest) =>
    DeleteByElementRequestSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    await elementEventWorkflowService.deleteElementEventWorkflowsByElement(
      data.elementId,
      token,
    );
    return { success: true };
  });

export const deleteElementEventWorkflowsByWorkflow = createServerFn({
  method: "POST",
})
  .inputValidator((data: DeleteByWorkflowRequest) =>
    DeleteByWorkflowRequestSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    await elementEventWorkflowService.deleteElementEventWorkflowsByWorkflow(
      data.workflowId,
      token,
    );
    return { success: true };
  });

export const disconnectElementEventWorkflow = createServerFn({
  method: "POST",
})
  .inputValidator((data: DisconnectConnectionRequest) =>
    DisconnectElementEventWorkflowSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();

    const connections =
      await elementEventWorkflowService.getElementEventWorkflowsByElement(
        data.elementId,
        token,
      );

    const connection = connections.find(
      (item) =>
        item.eventName === data.eventName &&
        item.workflowId === data.workflowId,
    );

    if (!connection) {
      throw new Error("Connection not found");
    }

    await elementEventWorkflowService.deleteElementEventWorkflow(
      connection.id,
      token,
    );

    return {
      success: true,
      connectionId: connection.id,
    };
  });
