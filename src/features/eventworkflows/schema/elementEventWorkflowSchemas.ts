/**
 * Zod Schemas for Element Event Workflow Connections
 * Provides type-safe validation for workflow-to-element event connections
 */

import { z } from "zod";
import { EventTypeSchema } from "./eventSchemas";

// ============================================
// ID SCHEMAS
// ============================================

/**
 * Schema for element ID - non-empty trimmed string
 */
export const ElementIdSchema = z
  .string()
  .trim()
  .min(1, "Element ID is required")
  .describe("Unique identifier for an element");

/**
 * Schema for workflow ID - non-empty trimmed string
 */
export const WorkflowIdSchema = z
  .string()
  .trim()
  .min(1, "Workflow ID is required")
  .describe("Unique identifier for a workflow");

/**
 * Schema for connection ID - non-empty string
 */
export const ConnectionIdSchema = z
  .string()
  .min(1, "Connection ID is required")
  .describe("Unique identifier for a connection");

// ============================================
// CONNECTION SCHEMAS
// ============================================

/**
 * Schema for element event workflow connection data from API
 */
export const ElementEventWorkflowConnectionSchema = z.object({
  id: ConnectionIdSchema,
  elementId: ElementIdSchema,
  eventName: EventTypeSchema,
  workflowId: WorkflowIdSchema,
  createdAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().or(z.date()),
});

/**
 * Schema for creating a new element event workflow connection
 */
export const CreateElementEventWorkflowSchema = z.object({
  elementId: ElementIdSchema,
  eventName: EventTypeSchema,
  workflowId: WorkflowIdSchema,
});

/**
 * Schema for disconnect input (same as create but used for different operation)
 */
export const DisconnectElementEventWorkflowSchema = z.object({
  elementId: ElementIdSchema,
  eventName: EventTypeSchema,
  workflowId: WorkflowIdSchema,
});

/**
 * Schema for updating a connection
 */
export const UpdateElementEventWorkflowSchema = z.object({
  eventName: EventTypeSchema.optional(),
  workflowId: WorkflowIdSchema.optional(),
});

/**
 * Schema for array of connections
 */
export const ElementEventWorkflowConnectionArraySchema = z.array(
  ElementEventWorkflowConnectionSchema,
);

// ============================================
// QUERY & RESPONSE SCHEMAS
// ============================================

/**
 * Schema for API response with connection data
 */
export const ConnectionResponseSchema = z.object({
  data: ElementEventWorkflowConnectionSchema,
});

/**
 * Schema for API response with array of connections
 */
export const ConnectionsArrayResponseSchema = z.object({
  data: ElementEventWorkflowConnectionArraySchema,
});

/**
 * Schema for paginated connections response
 */
export const PaginatedConnectionsResponseSchema = z.object({
  data: ElementEventWorkflowConnectionArraySchema,
  total: z.number().nonnegative(),
  page: z.number().positive(),
  pageSize: z.number().positive(),
});

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validates a connection object
 * @param data - Data to validate
 * @returns Safe parse result
 */
export function validateElementEventWorkflowConnection(data: unknown) {
  return ElementEventWorkflowConnectionSchema.safeParse(data);
}

/**
 * Validates connection creation input
 * @param data - Connection input to validate
 * @returns Safe parse result
 */
export function validateCreateConnection(data: unknown) {
  return CreateElementEventWorkflowSchema.safeParse(data);
}

/**
 * Validates disconnect input
 * @param data - Disconnect input to validate
 * @returns Safe parse result
 */
export function validateDisconnectConnection(data: unknown) {
  return DisconnectElementEventWorkflowSchema.safeParse(data);
}

/**
 * Validates update connection input
 * @param data - Update input to validate
 * @returns Safe parse result
 */
export function validateUpdateConnection(data: unknown) {
  return UpdateElementEventWorkflowSchema.safeParse(data);
}

/**
 * Validates array of connections
 * @param data - Array to validate
 * @returns Safe parse result
 */
export function validateConnectionArray(data: unknown) {
  return ElementEventWorkflowConnectionArraySchema.safeParse(data);
}

/**
 * Extract first error message from validation result
 * @param result - Validation result from safeParse
 * @returns First error message or null
 */
export function getFirstError(result: {
  success: boolean;
  error?: z.ZodError;
}): string | null {
  if (result.success) return null;
  return result.error?.issues[0]?.message ?? "Validation failed";
}

/**
 * Extract all error messages from validation result
 * @param result - Validation result from safeParse
 * @returns Array of error messages
 */
export function getAllErrors(result: {
  success: boolean;
  error?: z.ZodError;
}): string[] {
  if (result.success) return [];
  return (result.error?.issues ?? []).map(
    (err: z.ZodIssue) => `${err.path.join(".") || "field"}: ${err.message}`,
  );
}

/**
 * Format validation errors into readable string
 * @param result - Validation result from safeParse
 * @returns Formatted error string
 */
export function formatValidationErrors(result: {
  success: boolean;
  error?: z.ZodError;
}): string {
  if (result.success) return "";
  return getAllErrors(result).join("\n");
}

// ============================================
// TYPE EXPORTS
// ============================================

export type ElementEventWorkflowConnection = z.infer<
  typeof ElementEventWorkflowConnectionSchema
>;
export type CreateElementEventWorkflow = z.infer<
  typeof CreateElementEventWorkflowSchema
>;
export type DisconnectElementEventWorkflow = z.infer<
  typeof DisconnectElementEventWorkflowSchema
>;
export type UpdateElementEventWorkflow = z.infer<
  typeof UpdateElementEventWorkflowSchema
>;
