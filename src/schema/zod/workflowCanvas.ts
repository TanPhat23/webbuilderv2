import { z } from "zod";

/**
 * Zod schemas for validating the workflow canvas (nodes, connections, metadata).
 * This replaces ad-hoc validation logic with a type-safe schema and clear error messages.
 */

// Position schema
export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

// Base node data (label required, config optional and flexible)
const BaseNodeDataSchema = z.object({
  label: z.string().min(1, "Node label is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

// Discriminated node schemas (keeps shape consistent and allows per-type checks)
const TriggerNodeSchema = z.object({
  id: z.string().min(1, "Node id is required"),
  type: z.literal("trigger"),
  position: PositionSchema,
  data: BaseNodeDataSchema,
});

const ActionNodeSchema = z.object({
  id: z.string().min(1, "Node id is required"),
  type: z.literal("action"),
  position: PositionSchema,
  data: BaseNodeDataSchema,
});

const ConditionNodeSchema = z.object({
  id: z.string().min(1, "Node id is required"),
  type: z.literal("condition"),
  position: PositionSchema,
  data: BaseNodeDataSchema,
});

const OutputNodeSchema = z.object({
  id: z.string().min(1, "Node id is required"),
  type: z.literal("output"),
  position: PositionSchema,
  data: BaseNodeDataSchema,
});

export const WorkflowNodeSchema = z.discriminatedUnion("type", [
  TriggerNodeSchema,
  ActionNodeSchema,
  ConditionNodeSchema,
  OutputNodeSchema,
]);

// Connection schema
export const ConnectionSchema = z.object({
  id: z.string().min(1, "Connection id is required"),
  source: z.string().min(1, "Connection source is required"),
  target: z.string().min(1, "Connection target is required"),
  sourcePort: z.string().optional(),
  targetPort: z.string().optional(),
});

// Workflow canvas schema: nodes + connections + optional metadata
export const WorkflowCanvasSchema = z
  .object({
    nodes: z
      .array(WorkflowNodeSchema)
      .min(1, "Workflow must contain at least one node"),
    connections: z.array(ConnectionSchema).optional().default([]),
    metadata: z
      .object({
        name: z.string().optional(),
        description: z.string().optional(),
      })
      .optional(),
  })
  .superRefine((data: z.infer<typeof WorkflowCanvasSchema>, ctx) => {
    if (!data.nodes.some((n) => n.type === "trigger")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Workflow must contain at least one trigger node",
      });
    }

    if (!data.nodes.some((n) => n.type === "action")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Workflow must contain at least one action node",
      });
    }

    // Best-effort per-node config checks (provide clearer messages for common misconfigurations)
    data.nodes.forEach(
      (node: z.infer<typeof WorkflowNodeSchema>, idx: number) => {
        const cfg = node.data?.config;
        if (node.type === "trigger") {
          if (
            !cfg ||
            typeof cfg.eventType !== "string" ||
            !cfg.eventType.trim()
          ) {
            ctx.addIssue({
              path: ["nodes", idx, "data", "config", "eventType"],
              code: z.ZodIssueCode.custom,
              message:
                "Trigger node must include a non-empty 'eventType' in its config",
            });
          }
        }
        if (node.type === "action") {
          if (
            !cfg ||
            typeof cfg.actionType !== "string" ||
            !cfg.actionType.trim()
          ) {
            ctx.addIssue({
              path: ["nodes", idx, "data", "config", "actionType"],
              code: z.ZodIssueCode.custom,
              message:
                "Action node must include a non-empty 'actionType' in its config",
            });
          }
        }
        if (node.type === "condition") {
          if (
            !cfg ||
            typeof cfg.conditionType !== "string" ||
            !cfg.conditionType.trim()
          ) {
            ctx.addIssue({
              path: ["nodes", idx, "data", "config", "conditionType"],
              code: z.ZodIssueCode.custom,
              message:
                "Condition node should include a non-empty 'conditionType' in its config",
            });
          }
        }
      },
    );
  });

export function validateWorkflowCanvas(data: unknown) {
  return WorkflowCanvasSchema.safeParse(data);
}



export type WorkflowCanvasZodIssue = z.ZodIssue;
export type WorkflowCanvas = z.infer<typeof WorkflowCanvasSchema>;
export type WorkflowNode = z.infer<typeof WorkflowNodeSchema>;
export type Connection = z.infer<typeof ConnectionSchema>;
