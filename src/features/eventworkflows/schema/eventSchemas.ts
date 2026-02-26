/**
 * Zod Schemas for Event System Validation
 * Provides type-safe validation for all event-related data structures
 */

import { z } from "zod";

// ============================================
// BASIC TYPE SCHEMAS
// ============================================

export const EventTypeSchema = z.enum([
  "onClick",
  "onDoubleClick",
  "onMouseEnter",
  "onMouseLeave",
  "onMouseDown",
  "onMouseUp",
  "onFocus",
  "onBlur",
  "onChange",
  "onSubmit",
  "onKeyDown",
  "onKeyUp",
  "onScroll",
  "onLoad",
  "onError",
]);

export const ActionTypeSchema = z.enum([
  "navigate",
  "showElement",
  "hideElement",
  "toggleElement",
  "apiCall",
  "setData",
  "customCode",
  "scrollTo",
  "modal",
  "submitForm",
  "resetForm",
  "playAnimation",
  "showNotification",
  "copyToClipboard",
  "downloadFile",
  "toggleClass",
  "addClass",
  "removeClass",
]);

// ============================================
// ACTION CONFIG SCHEMAS
// ============================================

export const NavigateActionConfigSchema = z.object({
  type: z.literal("navigate"),
  target: z.enum(["url", "page", "external"]),
  value: z.string().min(1, "URL or page is required"),
  openInNewTab: z.boolean().optional(),
  replaceHistory: z.boolean().optional(),
});

export const ToggleElementActionConfigSchema = z.object({
  type: z.enum(["showElement", "hideElement", "toggleElement"]),
  elementId: z.string().min(1, "Element ID is required"),
  animationDuration: z.number().positive().optional(),
});

export const ApiCallActionConfigSchema = z.object({
  type: z.literal("apiCall"),
  url: z.url("Invalid URL format"),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.record(z.string(), z.any()).optional(),
  bodyType: z.enum(["json", "formData"]).optional(),
  storeResponseAs: z.string().optional(),
  onSuccess: z.lazy(() => EventHandlerSchema.array()).optional(),
  onError: z.lazy(() => EventHandlerSchema.array()).optional(),
  timeout: z.number().positive().optional(),
});

export const SetDataActionConfigSchema = z.object({
  type: z.literal("setData"),
  dataPath: z.string().min(1, "Data path is required"),
  value: z.any().optional(),
  valueType: z.enum(["static", "dynamic", "event"]).optional(),
  fromElement: z.string().optional(),
  fromAPI: z.string().optional(),
  fromEvent: z
    .enum(["target.value", "target.checked", "target.files"])
    .optional(),
});

export const CustomCodeActionConfigSchema = z.object({
  type: z.literal("customCode"),
  code: z.string().min(1, "Code is required"),
});

export const ScrollActionConfigSchema = z.object({
  type: z.literal("scrollTo"),
  target: z.enum(["elementId", "position"]),
  value: z.union([z.string(), z.number()]),
  behavior: z.enum(["smooth", "auto"]).optional(),
  offsetY: z.number().optional(),
});

export const ModalActionConfigSchema = z.object({
  type: z.literal("modal"),
  action: z.enum(["open", "close"]),
  modalId: z.string().optional(),
});

export const NotificationActionConfigSchema = z.object({
  type: z.literal("showNotification"),
  message: z.string().min(1, "Notification message is required"),
  notificationType: z.enum(["success", "error", "info", "warning"]).optional(),
  duration: z.number().positive().optional(),
});

export const CopyToClipboardActionConfigSchema = z.object({
  type: z.literal("copyToClipboard"),
  text: z.string().min(1, "Text to copy is required"),
  successMessage: z.string().optional(),
});

export const DownloadActionConfigSchema = z.object({
  type: z.literal("downloadFile"),
  url: z.string().url("Invalid file URL"),
  filename: z.string().optional(),
});

export const AnimationActionConfigSchema = z.object({
  type: z.literal("playAnimation"),
  elementId: z.string().min(1, "Element ID is required"),
  animationType: z.enum([
    "fadeIn",
    "slideIn",
    "bounce",
    "pulse",
    "shake",
    "spin",
  ]),
  duration: z.number().positive().optional(),
  delay: z.number().nonnegative().optional(),
});

export const FormActionConfigSchema = z.object({
  type: z.enum(["submitForm", "resetForm"]),
  formElementId: z.string().optional(),
});

export const ToggleClassActionConfigSchema = z.object({
  type: z.enum(["toggleClass", "addClass", "removeClass"]),
  elementId: z.string().min(1, "Element ID is required"),
  className: z.string().min(1, "Class name is required"),
  animationDuration: z.number().positive().optional(),
});

// Union schema for all action configs
export const EventActionConfigSchema = z.discriminatedUnion("type", [
  NavigateActionConfigSchema,
  ToggleElementActionConfigSchema,
  ApiCallActionConfigSchema,
  SetDataActionConfigSchema,
  CustomCodeActionConfigSchema,
  ScrollActionConfigSchema,
  ModalActionConfigSchema,
  NotificationActionConfigSchema,
  CopyToClipboardActionConfigSchema,
  DownloadActionConfigSchema,
  AnimationActionConfigSchema,
  FormActionConfigSchema,
  ToggleClassActionConfigSchema,
]);

// ============================================
// CONDITION SCHEMAS
// ============================================

export const ConditionOperatorSchema = z.enum([
  "==",
  "!=",
  ">",
  "<",
  ">=",
  "<=",
  "includes",
  "notIncludes",
]);

export const EventConditionSchema = z.object({
  id: z.string().min(1, "Condition ID is required"),
  type: z.enum(["stateEquals", "stateCheck", "customCode", "always"]),
  left: z.string().optional(),
  operator: ConditionOperatorSchema.optional(),
  right: z.any().optional(),
  customCode: z.string().optional(),
});

// ============================================
// EVENT HANDLER SCHEMAS
// ============================================

export const EventHandlerSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string().min(1, "Handler ID is required"),
    eventType: EventTypeSchema,
    actionType: ActionTypeSchema,
    enabled: z.boolean().optional().default(true),
    config: EventActionConfigSchema,
    delay: z.number().nonnegative().optional(),
    preventDefault: z.boolean().optional(),
    stopPropagation: z.boolean().optional(),
    conditions: EventConditionSchema.array().optional(),
    nextHandlers: EventHandlerSchema.array().optional(),
  }),
);

// ============================================
// ELEMENT EVENTS SCHEMA
// ============================================

export const ElementEventsSchema = z.record(
  z.string(),
  EventHandlerSchema.array(),
);

// ============================================
// EXECUTION CONTEXT SCHEMA
// ============================================

export const EventExecutionContextSchema = z.object({
  element: z.any(),
  event: z.any().optional(),
  elementState: z.record(z.string(), z.any()),
  globalState: z.record(z.string(), z.any()).optional(),
  elementInstance: z.any().optional(),
});

// ============================================
// EVENT REGISTRY SCHEMA
// ============================================

export const EventRegistrySchema = z.object({
  elementId: z.string().min(1, "Element ID is required"),
  events: ElementEventsSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validates a single event handler
 * @param handler - The handler to validate
 * @returns Validation result with either parsed data or errors
 */
export function validateEventHandler(handler: unknown) {
  return EventHandlerSchema.safeParse(handler);
}

/**
 * Validates multiple event handlers
 * @param handlers - Array of handlers to validate
 * @returns Validation result
 */
export function validateEventHandlers(handlers: unknown) {
  return EventHandlerSchema.array().safeParse(handlers);
}

/**
 * Validates element events collection
 * @param events - The events object to validate
 * @returns Validation result
 */
export function validateElementEvents(events: unknown) {
  return ElementEventsSchema.safeParse(events);
}

/**
 * Validates event action config with discriminated union
 * @param config - The config to validate
 * @returns Validation result
 */
export function validateEventActionConfig(config: unknown) {
  return EventActionConfigSchema.safeParse(config);
}

/**
 * Validates event condition
 * @param condition - The condition to validate
 * @returns Validation result
 */
export function validateEventCondition(condition: unknown) {
  return EventConditionSchema.safeParse(condition);
}

/**
 * Validates execution context
 * @param context - The context to validate
 * @returns Validation result
 */
export function validateEventExecutionContext(context: unknown) {
  return EventExecutionContextSchema.safeParse(context);
}

/**
 * Validates event registry
 * @param registry - The registry to validate
 * @returns Validation result
 */
export function validateEventRegistry(registry: unknown) {
  return EventRegistrySchema.safeParse(registry);
}

// ============================================
// ERROR FORMATTING UTILITIES
// ============================================

/**
 * Format Zod errors into a readable string
 * @param errors - Zod error array
 * @returns Formatted error string
 */
export function formatZodErrors(errors: z.ZodIssue[]): string {
  return errors
    .map((err) => {
      const path = err.path.join(".");
      return `${path || "root"}: ${err.message}`;
    })
    .join("\n");
}

/**
 * Extract error messages from SafeParseError
 * @param result - Result from safeParse
 * @returns Array of error strings
 */
export function extractErrorMessages(result: {
  success: false;
  error: z.ZodError;
}): string[] {
  return result.error.issues.map((issue) => {
    const path = issue.path.join(".");
    return `${path || "config"}: ${issue.message}`;
  });
}

// ============================================
// TYPE EXPORTS
// ============================================

export type EventType = z.infer<typeof EventTypeSchema>;
export type ActionType = z.infer<typeof ActionTypeSchema>;
export type EventActionConfig = z.infer<typeof EventActionConfigSchema>;
export type EventHandler = z.infer<typeof EventHandlerSchema>;
export type ElementEvents = z.infer<typeof ElementEventsSchema>;
export type EventCondition = z.infer<typeof EventConditionSchema>;
export type EventExecutionContext = z.infer<typeof EventExecutionContextSchema>;
export type EventRegistry = z.infer<typeof EventRegistrySchema>;
