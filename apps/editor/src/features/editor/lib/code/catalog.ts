import {
  componentChildren,
  componentOverrideFields,
  componentSetting,
  type ComponentOverride,
} from "@webbuilder/site-runtime/projects/components";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";

export type OverrideField = keyof ComponentOverride;

export interface ComponentPropBinding {
  readonly nodeId: string;
  readonly field: OverrideField;
  readonly defaultValue: string;
}

export interface CatalogComponentInput {
  readonly pageId: string;
  readonly name: string;
  readonly root: EditorElement;
}

export interface CatalogComponent {
  readonly pageId: string;
  readonly name: string;
  readonly pascalName: string;
  readonly root: EditorElement;
  readonly props: Readonly<Record<string, ComponentPropBinding>>;
}

export interface ComponentCatalog {
  readonly list: readonly CatalogComponent[];
  readonly byPageId: ReadonlyMap<string, CatalogComponent>;
  readonly byPascalName: ReadonlyMap<string, CatalogComponent>;
}

export const MAX_CATALOG_COMPONENTS = 200;

const RESERVED_COMPONENT_NAMES: ReadonlySet<string> = new Set([
  "React",
  "Fragment",
  "Generated",
  "Carousel",
  "CMSContentList",
  "CMSContentGrid",
  "CMSContentItem",
]);

const FORBIDDEN_PROP_NAMES: ReadonlySet<string> = new Set([
  "__proto__",
  "constructor",
  "prototype",
  "children",
  "key",
  "ref",
  "className",
  "style",
  "id",
  "data-element-id",
]);

const VALID_OVERRIDE_FIELDS: ReadonlySet<string> = new Set(["text", "src", "alt", "href"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOverrideField(value: unknown): value is OverrideField {
  return typeof value === "string" && VALID_OVERRIDE_FIELDS.has(value);
}

function uniqueIdentifier(base: string, used: Set<string>): string {
  let candidate = base;
  for (let n = 2; used.has(candidate); n++) {
    candidate = `${base}${n}`;
  }
  used.add(candidate);
  return candidate;
}

/** Converts an arbitrary component display name into a collision-free React PascalCase identifier. */
export function toComponentPascalName(raw: string, used = new Set<string>()): string {
  const words = raw
    .split(/[^A-Za-z0-9]+/)
    .filter((w) => w.length > 0)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  let base = words.join("") || "Component";
  if (/^[0-9]/.test(base)) base = `Component${base}`;
  if (RESERVED_COMPONENT_NAMES.has(base)) base = `${base}Component`;
  return uniqueIdentifier(base, used);
}

function toCamelBase(raw: string, fallback: string): string {
  const trimmed = raw.trim();
  if (FORBIDDEN_PROP_NAMES.has(trimmed)) return fallback;
  const words = trimmed
    .split(/[^A-Za-z0-9]+/)
    .filter((w) => w.length > 0);
  if (words.length === 0) return fallback;
  const first = words[0]?.toLowerCase() ?? fallback;
  const rest = words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  const joined = [first, ...rest].join("");
  if (/^[0-9]/.test(joined) || FORBIDDEN_PROP_NAMES.has(joined)) return fallback;
  return joined;
}

function defaultFieldValue(element: EditorElement, field: OverrideField): string {
  if (field === "src") return element.src ?? "";
  if (field === "href") return element.href ?? "";
  return element.content ?? "";
}

/** Reads and validates explicit `settings.componentProps` bindings, stripping forbidden/prototype keys. */
export function readStoredComponentProps(
  settings: unknown,
): Readonly<Record<string, ComponentPropBinding>> | null {
  if (!isRecord(settings) || !isRecord(settings.componentProps)) return null;
  const source = settings.componentProps;
  const out: Record<string, ComponentPropBinding> = {};
  Object.setPrototypeOf(out, null);
  let count = 0;
  for (const [propName, raw] of Object.entries(source)) {
    if (
      !propName ||
      FORBIDDEN_PROP_NAMES.has(propName) ||
      !Object.hasOwn(source, propName) ||
      !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(propName) ||
      !isRecord(raw) ||
      typeof raw.nodeId !== "string" ||
      !raw.nodeId ||
      !isOverrideField(raw.field) ||
      typeof raw.defaultValue !== "string"
    ) {
      continue;
    }
    out[propName] = {
      nodeId: raw.nodeId,
      field: raw.field,
      defaultValue: raw.defaultValue,
    };
    count++;
  }
  return count > 0 ? out : null;
}

/** Derives deterministic camelCase prop bindings from a component master tree or returns stored explicit bindings. */
export function synthesizeComponentProps(
  root: EditorElement,
): Readonly<Record<string, ComponentPropBinding>> {
  const explicit = readStoredComponentProps(root.settings);
  if (explicit) return explicit;

  const used = new Set<string>(FORBIDDEN_PROP_NAMES);
  const out: Record<string, ComponentPropBinding> = {};
  Object.setPrototypeOf(out, null);

  const visit = (node: EditorElement): void => {
    const fields = componentOverrideFields(node);
    const fallback = node.type.toLowerCase();
    const base = toCamelBase(node.name ?? "", fallback);
    for (const field of fields) {
      const propBase =
        fields.length === 1 && field === "text"
          ? base
          : `${base}${field.charAt(0).toUpperCase()}${field.slice(1)}`;
      const safeBase = FORBIDDEN_PROP_NAMES.has(propBase) ? `${fallback}Value` : propBase;
      const name = uniqueIdentifier(safeBase, used);
      out[name] = {
        nodeId: node.id,
        field,
        defaultValue: defaultFieldValue(node, field),
      };
    }
    if (!componentSetting(node)) {
      for (const child of componentChildren(node) ?? []) visit(child);
    }
  };

  visit(root);
  return out;
}

export const EMPTY_COMPONENT_CATALOG: ComponentCatalog = {
  list: [],
  byPageId: new Map(),
  byPascalName: new Map(),
};

/** Indexes component masters by `pageId` and deduplicated `pascalName`. */
export function buildComponentCatalog(
  inputs: readonly CatalogComponentInput[],
): ComponentCatalog {
  if (inputs.length === 0) return EMPTY_COMPONENT_CATALOG;
  const usedNames = new Set<string>();
  const list: CatalogComponent[] = [];
  const byPageId = new Map<string, CatalogComponent>();
  const byPascalName = new Map<string, CatalogComponent>();

  for (const item of inputs.slice(0, MAX_CATALOG_COMPONENTS)) {
    if (!item.pageId || byPageId.has(item.pageId)) continue;
    const pascalName = toComponentPascalName(item.name, usedNames);
    const entry: CatalogComponent = {
      pageId: item.pageId,
      name: item.name,
      pascalName,
      root: item.root,
      props: synthesizeComponentProps(item.root),
    };
    list.push(entry);
    byPageId.set(entry.pageId, entry);
    byPascalName.set(entry.pascalName, entry);
  }

  return { list, byPageId, byPascalName };
}

/** Converts a kebab-case Lucide icon name (e.g. `check-circle-2`) to PascalCase (`CheckCircle2`). */
export function lucideKebabToPascal(iconName: string): string {
  const cleaned = iconName
    .trim()
    .split(/[^A-Za-z0-9]+/)
    .filter((part) => part.length > 0)
    .map((part) => (/^[0-9]+$/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()))
    .join("");
  return cleaned && /^[A-Z]/.test(cleaned) ? cleaned : "Star";
}

/** Converts a PascalCase Lucide icon export name (e.g. `CheckCircle2`) to kebab-case (`check-circle-2`). */
export function lucidePascalToKebab(exportName: string): string {
  return exportName
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Za-z])([0-9]+)/g, "$1-$2")
    .toLowerCase();
}
