import { CONTAINER_ELEMENT_TYPES } from "@webbuilder/site-runtime/types/elements";
import { HIDDEN_SETTINGS } from "@/features/editor/lib/code/customCode";
import { MAX_REVEAL_DELAY, REVEAL_EFFECTS } from "@webbuilder/site-runtime/preview/reveal";
import {
  validComponentOverrides,
  type ComponentOverrides,
} from "@webbuilder/site-runtime/projects/components";
import type { AgentIssue } from "./protocol";

export const AGENT_ELEMENT_TYPES = [
  "Section",
  "Frame",
  "Text",
  "Button",
  "Link",
  "Image",
  "Input",
  "Select",
  "List",
  "Form",
  "Carousel",
] as const;

export const CONTAINERS: ReadonlySet<string> = new Set([
  ...CONTAINER_ELEMENT_TYPES,
  "Select",
]);

export const MAX_OPS = 200;
export const MAX_ELEMENTS = 2_000;
export const TEXT_FIELDS = [
  "name",
  "content",
  "tailwindStyles",
  "src",
  "href",
] as const;

const MAX_TEXT = 20_000;
const MAX_SETTINGS_JSON = 20_000;
const RESERVED: ReadonlySet<string> = new Set(HIDDEN_SETTINGS);

export type ComponentOverridePatch =
  | { clear: true }
  | { clear: false; overrides: ComponentOverrides };

export interface ValidatedPatch {
  name?: string;
  content?: string;
  tailwindStyles?: string;
  src?: string;
  href?: string;
  settings?: Record<string, unknown>;
  componentOverride?: ComponentOverridePatch;
}

export type ValidatedCreateElement = (
  | { kind: "element"; type: string }
  | {
      kind: "component";
      type?: string;
      component: { id: string; overrides?: ComponentOverrides };
    }
) &
  ValidatedPatch;

export type ValidatedEditOp =
  | {
      op: "create";
      element: ValidatedCreateElement;
      ref?: string;
      parentId?: string | null;
      index?: number;
    }
  | { op: "update"; id: string; set: ValidatedPatch }
  | { op: "move"; id: string; parentId?: string | null; index?: number }
  | { op: "delete"; id: string };

export function isRecordObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function validateTextFields(
  obj: Record<string, unknown>,
  path: string,
): AgentIssue | undefined {
  for (const field of TEXT_FIELDS) {
    const val = obj[field];
    if (val === undefined) continue;
    if (typeof val !== "string") {
      return { path: `${path}.${field}`, message: "must be a string" };
    }
    if (val.length > MAX_TEXT) {
      return {
        path: `${path}.${field}`,
        message: `longer than ${MAX_TEXT} characters`,
      };
    }
  }
  return undefined;
}

function validateRevealSettings(
  settings: Record<string, unknown>,
  path: string,
): AgentIssue | undefined {
  const { reveal, revealDelay } = settings;
  if (
    reveal !== undefined &&
    !REVEAL_EFFECTS.some((effect) => effect === reveal)
  ) {
    return {
      path: `${path}.settings.reveal`,
      message: `must be one of ${REVEAL_EFFECTS.join(", ")}`,
    };
  }
  if (
    revealDelay !== undefined &&
    (typeof revealDelay !== "number" ||
      !Number.isFinite(revealDelay) ||
      revealDelay < 0 ||
      revealDelay > MAX_REVEAL_DELAY)
  ) {
    return {
      path: `${path}.settings.revealDelay`,
      message: `must be a number of milliseconds from 0 to ${MAX_REVEAL_DELAY}`,
    };
  }
  return undefined;
}

function validateSettingsObject(
  settings: unknown,
  path: string,
  allowComponent: boolean,
): AgentIssue | undefined {
  if (!isRecordObject(settings)) {
    return { path: `${path}.settings`, message: "must be an object" };
  }
  if (JSON.stringify(settings).length > MAX_SETTINGS_JSON) {
    return { path: `${path}.settings`, message: "too large" };
  }
  for (const key of Object.keys(settings)) {
    if (allowComponent && key === "component") continue;
    if (RESERVED.has(key)) {
      return {
        path: `${path}.settings.${key}`,
        message: `"${key}" is reserved and cannot be set from here`,
      };
    }
  }
  return validateRevealSettings(settings, path);
}

function validateFields(
  obj: Record<string, unknown>,
  path: string,
  allowComponent: boolean,
): AgentIssue | undefined {
  const textIssue = validateTextFields(obj, path);
  if (textIssue) return textIssue;
  if (obj.settings !== undefined) {
    return validateSettingsObject(obj.settings, path, allowComponent);
  }
  return undefined;
}

function validateCreateComponent(
  component: unknown,
  path: string,
):
  | { ok: true; value: { id: string; overrides?: ComponentOverrides } }
  | { ok: false; issue: AgentIssue } {
  if (
    !isRecordObject(component) ||
    typeof component.id !== "string" ||
    !component.id.trim() ||
    component.id.length > 255 ||
    Object.keys(component).some((key) => key !== "id" && key !== "overrides")
  ) {
    return {
      ok: false,
      issue: {
        path,
        message: "must contain a component page id and optional overrides",
      },
    };
  }
  if (
    component.overrides !== undefined &&
    !validComponentOverrides(component.overrides)
  ) {
    return {
      ok: false,
      issue: {
        path: `${path}.overrides`,
        message: "must be a bounded map of text, src, alt or href strings",
      },
    };
  }
  return {
    ok: true,
    value: {
      id: component.id,
      ...(component.overrides !== undefined && {
        overrides: component.overrides,
      }),
    },
  };
}

function pickValidatedPatchFields(obj: Record<string, unknown>): ValidatedPatch {
  const out: ValidatedPatch = {};
  if (typeof obj.name === "string") out.name = obj.name;
  if (typeof obj.content === "string") out.content = obj.content;
  if (typeof obj.tailwindStyles === "string") {
    out.tailwindStyles = obj.tailwindStyles;
  }
  if (typeof obj.src === "string") out.src = obj.src;
  if (typeof obj.href === "string") out.href = obj.href;
  if (isRecordObject(obj.settings)) {
    const { component: _component, ...rest } = obj.settings;
    out.settings = rest;
  }
  return out;
}

function validateCreateElement(
  element: unknown,
  path: string,
):
  | { ok: true; value: ValidatedCreateElement }
  | { ok: false; issue: AgentIssue } {
  if (!isRecordObject(element)) {
    return { ok: false, issue: { path, message: "create needs an element" } };
  }
  let validatedComponent:
    | { id: string; overrides?: ComponentOverrides }
    | undefined;
  if (element.component !== undefined) {
    const res = validateCreateComponent(element.component, `${path}.component`);
    if (!res.ok) return res;
    validatedComponent = res.value;
  }
  const hasAllowedType = AGENT_ELEMENT_TYPES.some(
    (type) => type === element.type,
  );
  if (
    (element.component === undefined || element.type !== undefined) &&
    !hasAllowedType
  ) {
    return {
      ok: false,
      issue: {
        path: `${path}.type`,
        message: `unsupported type ${JSON.stringify(element.type)}; use one of ${AGENT_ELEMENT_TYPES.join(", ")}`,
      },
    };
  }
  if (isRecordObject(element.settings) && "component" in element.settings) {
    return {
      ok: false,
      issue: {
        path: `${path}.settings.component`,
        message: "use element.component to create a linked instance",
      },
    };
  }
  const fieldsIssue = validateFields(element, path, false);
  if (fieldsIssue) return { ok: false, issue: fieldsIssue };

  const patch = pickValidatedPatchFields(element);
  if (validatedComponent) {
    const type = typeof element.type === "string" ? element.type : undefined;
    return {
      ok: true,
      value: {
        ...patch,
        kind: "component",
        component: validatedComponent,
        ...(type !== undefined && { type }),
      },
    };
  }
  if (typeof element.type !== "string") {
    return {
      ok: false,
      issue: { path: `${path}.type`, message: "element type is required" },
    };
  }
  return {
    ok: true,
    value: { ...patch, kind: "element", type: element.type },
  };
}

function validateComponentOverridePatch(
  setting: unknown,
  path: string,
):
  | { ok: true; value: ComponentOverridePatch }
  | { ok: false; issue: AgentIssue } {
  if (
    !isRecordObject(setting) ||
    Object.keys(setting).length !== 1 ||
    !Object.hasOwn(setting, "overrides")
  ) {
    return {
      ok: false,
      issue: {
        path,
        message:
          "must be a bounded map of content overrides or null to clear it",
      },
    };
  }
  if (setting.overrides === null) {
    return { ok: true, value: { clear: true } };
  }
  if (!validComponentOverrides(setting.overrides)) {
    return {
      ok: false,
      issue: {
        path,
        message:
          "must be a bounded map of content overrides or null to clear it",
      },
    };
  }
  return {
    ok: true,
    value: { clear: false, overrides: setting.overrides },
  };
}

function validateUpdateFields(
  fields: unknown,
  path: string,
): { ok: true; value: ValidatedPatch } | { ok: false; issue: AgentIssue } {
  if (!isRecordObject(fields)) {
    return {
      ok: false,
      issue: { path, message: "update needs the fields to set" },
    };
  }
  const fieldsIssue = validateFields(fields, path, true);
  if (fieldsIssue) return { ok: false, issue: fieldsIssue };

  const patch = pickValidatedPatchFields(fields);
  if (isRecordObject(fields.settings) && "component" in fields.settings) {
    const overrideRes = validateComponentOverridePatch(
      fields.settings.component,
      `${path}.settings.component.overrides`,
    );
    if (!overrideRes.ok) return overrideRes;
    patch.componentOverride = overrideRes.value;
  }
  return { ok: true, value: patch };
}

function validateCommonPlacement(
  op: Record<string, unknown>,
  path: string,
):
  | { ok: true; parentId?: string | null; index?: number }
  | { ok: false; issue: AgentIssue } {
  if (
    op.parentId !== undefined &&
    op.parentId !== null &&
    typeof op.parentId !== "string"
  ) {
    return {
      ok: false,
      issue: { path: `${path}.parentId`, message: "must be a string or null" },
    };
  }
  if (
    op.index !== undefined &&
    (typeof op.index !== "number" ||
      !Number.isInteger(op.index) ||
      op.index < 0)
  ) {
    return {
      ok: false,
      issue: {
        path: `${path}.index`,
        message: "must be a non-negative integer",
      },
    };
  }
  const parentId =
    typeof op.parentId === "string" || op.parentId === null
      ? op.parentId
      : undefined;
  const index = typeof op.index === "number" ? op.index : undefined;
  return { ok: true, parentId, index };
}

function validateSingleOp(
  rawOp: unknown,
  path: string,
): { ok: true; op: ValidatedEditOp } | { ok: false; issue: AgentIssue } {
  if (!isRecordObject(rawOp)) {
    return { ok: false, issue: { path, message: "must be an object" } };
  }
  const opKind = rawOp.op;
  if (
    opKind !== "create" &&
    opKind !== "update" &&
    opKind !== "move" &&
    opKind !== "delete"
  ) {
    return {
      ok: false,
      issue: {
        path: `${path}.op`,
        message: "must be create, update, move or delete",
      },
    };
  }
  const placement = validateCommonPlacement(rawOp, path);
  if (!placement.ok) return placement;

  if (opKind === "create") {
    const el = validateCreateElement(rawOp.element, `${path}.element`);
    if (!el.ok) return el;
    if (rawOp.ref !== undefined && (typeof rawOp.ref !== "string" || !rawOp.ref)) {
      return {
        ok: false,
        issue: { path: `${path}.ref`, message: "a ref must be a new, unique name" },
      };
    }
    return {
      ok: true,
      op: {
        op: "create",
        element: el.value,
        ...(typeof rawOp.ref === "string" && { ref: rawOp.ref }),
        parentId: placement.parentId,
        index: placement.index,
      },
    };
  }

  if (typeof rawOp.id !== "string" || !rawOp.id) {
    return {
      ok: false,
      issue: { path: `${path}.id`, message: `${opKind} needs an element id` },
    };
  }
  if (opKind === "update") {
    const patch = validateUpdateFields(rawOp.set, `${path}.set`);
    if (!patch.ok) return patch;
    return { ok: true, op: { op: "update", id: rawOp.id, set: patch.value } };
  }
  if (opKind === "move") {
    return {
      ok: true,
      op: {
        op: "move",
        id: rawOp.id,
        parentId: placement.parentId,
        index: placement.index,
      },
    };
  }
  return { ok: true, op: { op: "delete", id: rawOp.id } };
}

export function validateEditOps(
  ops: unknown,
): { ok: true; ops: ValidatedEditOp[] } | { ok: false; issue: AgentIssue } {
  if (!Array.isArray(ops) || ops.length === 0) {
    return {
      ok: false,
      issue: { path: "operations", message: "at least one operation is required" },
    };
  }
  if (ops.length > MAX_OPS) {
    return {
      ok: false,
      issue: {
        path: "operations",
        message: `at most ${MAX_OPS} operations per call`,
      },
    };
  }
  const validated: ValidatedEditOp[] = [];
  for (let index = 0; index < ops.length; index++) {
    const res = validateSingleOp(ops[index], `operations[${index}]`);
    if (!res.ok) return res;
    validated.push(res.op);
  }
  return { ok: true, ops: validated };
}
