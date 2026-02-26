import { z } from "zod";

/**
 * Zod Schemas for Event Workflow Management
 * Provides type-safe validation for workflow creation and updates
 */

// ============================================
// WORKFLOW CREATION SCHEMA
// ============================================

export const CreateEventWorkflowSchema = z.object({
  name: z
    .string()
    .min(1, "Workflow name is required")
    .min(3, "Workflow name must be at least 3 characters")
    .max(100, "Workflow name must not exceed 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .transform((val) => (val?.trim() === "" ? undefined : val?.trim()))
    .optional(),
});

export type CreateEventWorkflowFormData = z.infer<
  typeof CreateEventWorkflowSchema
>;

// ============================================
// WORKFLOW UPDATE SCHEMA
// ============================================

export const UpdateEventWorkflowSchema = z.object({
  name: z
    .string()
    .min(1, "Workflow name is required")
    .min(3, "Workflow name must be at least 3 characters")
    .max(100, "Workflow name must not exceed 100 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .transform((val) => (val?.trim() === "" ? undefined : val?.trim()))
    .optional(),
  enabled: z.boolean().optional(),
});

export type UpdateEventWorkflowFormData = z.infer<
  typeof UpdateEventWorkflowSchema
>;

// ============================================
// WORKFLOW FILTER/SEARCH SCHEMA
// ============================================

export const WorkflowFilterSchema = z.object({
  search: z
    .string()
    .max(100, "Search query must not exceed 100 characters")
    .optional(),
  enabled: z.boolean().optional(),
});

export type WorkflowFilterFormData = z.infer<typeof WorkflowFilterSchema>;

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validates workflow creation form data
 * @param data - The form data to validate
 * @returns Validation result
 */
export function validateCreateEventWorkflow(data: unknown) {
  return CreateEventWorkflowSchema.safeParse(data);
}

/**
 * Validates workflow update form data
 * @param data - The form data to validate
 * @returns Validation result
 */
export function validateUpdateEventWorkflow(data: unknown) {
  return UpdateEventWorkflowSchema.safeParse(data);
}

/**
 * Validates workflow filter form data
 * @param data - The form data to validate
 * @returns Validation result
 */
export function validateWorkflowFilter(data: unknown) {
  return WorkflowFilterSchema.safeParse(data);
}
