import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import type { ComponentSource } from "@webbuilder/site-runtime/projects/components";
import {
  AGENT_ELEMENT_TYPES,
  MAX_OPS,
  validateEditOps,
} from "./editOpsValidation";
import { applyValidatedBatch, type EditResult } from "./editOpsTree";

export { AGENT_ELEMENT_TYPES, MAX_OPS, type EditResult };

export function applyEdits(
  current: EditorElement[],
  ops: unknown,
  pageId: string,
  components?: ComponentSource,
): EditResult {
  const validated = validateEditOps(ops);
  if (!validated.ok) return { ok: false, issues: [validated.issue] };
  return applyValidatedBatch(current, validated.ops, pageId, components);
}
