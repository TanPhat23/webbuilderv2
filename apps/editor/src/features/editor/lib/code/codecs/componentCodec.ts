import { generate } from "@babel/generator";
import * as t from "@babel/types";
import { isEqual } from "lodash-es";
import {
  componentSetting,
  makeComponentInstance,
  type ComponentOverrides,
  type ComponentSetting,
} from "@webbuilder/site-runtime/projects/components";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import {
  attributeName,
  attributeValue,
  CodeError,
  isTag,
  stringAttributeValue,
  unparen,
} from "../astLiterals";
import {
  toComponentPascalName,
  type CatalogComponent,
  type ComponentPropBinding,
  type OverrideField,
} from "../catalog";
import { classNameFor, splitClasses, styleClasses } from "../classNames";
import { HIDDEN_SETTINGS, readCodeVisible } from "../customCode";
import {
  evaluateStaticExpression,
  findUnboundIdentifier,
  type StaticValue,
} from "../normalize/staticScope";
import type { PendingComponentInstance } from "../normalize/extractComponents";
import { updateElementSettings } from "../parseElements";
import {
  codePropNames,
  decorateGeneratedElement,
  isPlainRecord,
  selfClosingJsxEl,
  type JsxChildNode,
} from "./shared";
import type { GenerateNodeContext } from "./types";

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

export interface ParamPropInfo {
  readonly propName: string;
  readonly defaultValue: string;
}

export interface ExtractedParamDefaults {
  readonly paramsByLocalName: ReadonlyMap<string, ParamPropInfo>;
  readonly propsObjectName: string | undefined;
  readonly defaultsByPropName: ReadonlyMap<string, string>;
}

export interface ComponentPropSlots {
  readonly paramsByLocalName: ReadonlyMap<string, ParamPropInfo>;
  readonly propsObjectName: string | undefined;
  readonly bindings: Map<string, ComponentPropBinding>;
}

export interface ComponentInstanceParseContext {
  readonly byId: ReadonlyMap<string, EditorElement>;
  readonly pageId: string | undefined;
  readonly claimed: Set<string>;
  readonly boundIdentifiers?: ReadonlySet<string>;
  readonly staticConsts?: ReadonlyMap<string, StaticValue>;
  readonly pendingInstances?: PendingComponentInstance[];
}

/**
 * Generates a JSX element for a linked project component instance, emitting
 * `className`, non-default prop attributes, `codeProps`, and `data-element-id`.
 */
export function generateComponentInstance(
  element: EditorElement,
  catalogEntry: CatalogComponent,
  ctx: GenerateNodeContext,
): t.JSXElement {
  ctx.usedProjectComponents.add(catalogEntry.pascalName);
  const attrs: Array<t.JSXAttribute | t.JSXSpreadAttribute> = [];
  const overridden = codePropNames(element.settings);
  const cls = classNameFor(element);
  if (cls && !overridden.has("className")) {
    attrs.push(t.jsxAttribute(t.jsxIdentifier("className"), t.stringLiteral(cls)));
  }

  const setting = componentSetting(element);
  const overrides = setting?.overrides;
  for (const [propName, binding] of Object.entries(catalogEntry.props)) {
    if (overridden.has(propName)) continue;
    const nodeOverride =
      overrides && Object.hasOwn(overrides, binding.nodeId)
        ? overrides[binding.nodeId]
        : undefined;
    const value = nodeOverride ? nodeOverride[binding.field] : undefined;
    if (typeof value === "string" && value !== binding.defaultValue) {
      attrs.push(t.jsxAttribute(t.jsxIdentifier(propName), t.stringLiteral(value)));
    }
  }

  const node = selfClosingJsxEl(catalogEntry.pascalName, attrs);
  return decorateGeneratedElement(node, element, ctx.tagElementIds);
}

function setOrReplaceJsxAttribute(
  node: t.JSXElement,
  attrName: string,
  value: t.JSXAttribute["value"],
): void {
  const attrs = node.openingElement.attributes;
  const idx = attrs.findIndex(
    (attr) => t.isJSXAttribute(attr) && attributeName(attr) === attrName,
  );
  const nextAttr = t.jsxAttribute(t.jsxIdentifier(attrName), value);
  if (idx >= 0) {
    attrs[idx] = nextAttr;
  } else {
    attrs.push(nextAttr);
  }
}

function replaceTextChildrenWithProp(
  children: JsxChildNode[],
  propName: string,
): JsxChildNode[] {
  const expr = t.jsxExpressionContainer(t.identifier(propName));
  const elementChildren = children.filter((child) => t.isJSXElement(child));
  return [expr, ...elementChildren];
}

/**
 * Rewrites a generated master element's JSX node to reference `{propName}`
 * expressions at each bound `(nodeId, field)` slot.
 */
export function bindComponentPropsToJsx(
  node: t.JSXElement,
  element: EditorElement,
  bindings: ReadonlyMap<OverrideField, string>,
): t.JSXElement {
  const textProp = bindings.get("text");
  if (textProp) {
    if (element.type === "Code" && isTag(node, "pre")) {
      const codeChild = node.children.find((child): child is t.JSXElement =>
        isTag(child, "code"),
      );
      if (codeChild) {
        codeChild.children = replaceTextChildrenWithProp(codeChild.children, textProp);
      }
    } else {
      node.children = replaceTextChildrenWithProp(node.children, textProp);
    }
  }

  const hrefProp = bindings.get("href");
  if (hrefProp) {
    const attrName = element.type === "Button" ? "data-href" : "href";
    setOrReplaceJsxAttribute(
      node,
      attrName,
      t.jsxExpressionContainer(t.identifier(hrefProp)),
    );
  }

  const srcProp = bindings.get("src");
  if (srcProp) {
    setOrReplaceJsxAttribute(
      node,
      "src",
      t.jsxExpressionContainer(t.identifier(srcProp)),
    );
  }

  const altProp = bindings.get("alt");
  if (altProp) {
    setOrReplaceJsxAttribute(
      node,
      "alt",
      t.jsxExpressionContainer(t.identifier(altProp)),
    );
  }

  return node;
}

export interface GenerateComponentMasterModuleInput {
  readonly componentName?: string;
  readonly root?: EditorElement;
  readonly innerJsx: string;
  readonly props: Readonly<Record<string, ComponentPropBinding>>;
  readonly imports: string;
  readonly top: string;
  readonly body: string;
}

/**
 * Emits a typed `"cp"` master component module with `export interface <Name>Props`,
 * destructured default values, and `export default <Name>`.
 */
export function generateComponentMasterModule(
  input: GenerateComponentMasterModuleInput,
): string {
  const pascalName = toComponentPascalName(
    input.componentName ?? input.root?.name ?? "Component",
  );
  const propEntries = Object.entries(input.props);
  const interfaceLines =
    propEntries.length > 0
      ? propEntries.map(([name]) => `  readonly ${name}?: string;`).join("\n")
      : "";
  const propsInterface = `export interface ${pascalName}Props {\n${
    interfaceLines ? `${interfaceLines}\n` : ""
  }}`;

  const paramList = propEntries
    .map(([name, binding]) => `${name} = ${JSON.stringify(binding.defaultValue)}`)
    .join(", ");
  const signature =
    propEntries.length > 0
      ? `{ ${paramList} }: ${pascalName}Props`
      : `_props: ${pascalName}Props`;

  const topBlock = input.top.trim() ? `\n${input.top.trim()}\n` : "";
  const bodyBlock = input.body.trim() ? `\n${input.body.trim()}\n` : "";
  const jsxBody = input.innerJsx.trim() ? input.innerJsx : "<></>";

  return `/**
 * Generated component
 * Note: TypeScript errors in Monaco editor are expected - the editor
 * doesn't have full project context.
 */
${input.imports}
${topBlock}
${propsInterface}

export function ${pascalName}(${signature}) {${bodyBlock}
  return (
    ${jsxBody}
  );
}

export default ${pascalName};
`;
}

function defaultLiteralToString(
  node: t.Node,
  staticConsts?: ReadonlyMap<string, StaticValue>,
): string {
  if (t.isStringLiteral(node)) return node.value;
  if (staticConsts) {
    const res = evaluateStaticExpression(node, staticConsts);
    if (res.ok) {
      if (typeof res.value === "string") return res.value;
      if (typeof res.value === "number" || typeof res.value === "boolean") {
        return String(res.value);
      }
    }
  }
  if (t.isNumericLiteral(node) || t.isBooleanLiteral(node)) {
    return String(node.value);
  }
  return "";
}

/**
 * Extracts prop names, local aliases, and string default values from a component
 * function's first parameter (`{ title = "Fast" }` or `props`).
 */
export function extractComponentParamDefaults(
  fn: t.Function | null,
  staticConsts?: ReadonlyMap<string, StaticValue>,
): ExtractedParamDefaults {
  const paramsByLocalName = new Map<string, ParamPropInfo>();
  const defaultsByPropName = new Map<string, string>();
  let propsObjectName: string | undefined;

  if (!fn || fn.params.length === 0) {
    return { paramsByLocalName, propsObjectName, defaultsByPropName };
  }

  let firstParam: t.Node = fn.params[0]!;
  if (t.isTSParameterProperty(firstParam)) {
    firstParam = firstParam.parameter;
  }
  if (t.isAssignmentPattern(firstParam)) {
    firstParam = firstParam.left;
  }

  if (t.isIdentifier(firstParam)) {
    propsObjectName = firstParam.name;
    return { paramsByLocalName, propsObjectName, defaultsByPropName };
  }

  if (t.isObjectPattern(firstParam)) {
    for (const prop of firstParam.properties) {
      if (!t.isObjectProperty(prop) || prop.computed) continue;
      const propName = t.isIdentifier(prop.key)
        ? prop.key.name
        : t.isStringLiteral(prop.key)
          ? prop.key.value
          : null;
      if (!propName || FORBIDDEN_PROP_NAMES.has(propName)) continue;

      let localName: string | null = null;
      let defaultValue = "";

      if (t.isIdentifier(prop.value)) {
        localName = prop.value.name;
      } else if (t.isAssignmentPattern(prop.value) && t.isIdentifier(prop.value.left)) {
        localName = prop.value.left.name;
        defaultValue = defaultLiteralToString(prop.value.right, staticConsts);
      }

      if (localName) {
        paramsByLocalName.set(localName, { propName, defaultValue });
        defaultsByPropName.set(propName, defaultValue);
      }
    }
  }

  return { paramsByLocalName, propsObjectName, defaultsByPropName };
}

/**
 * Matches a JSX expression against component parameter slots (`{title}`, `{props.title}`,
 * or `{props.title ?? "Default"}`).
 */
export function matchPropExpression(
  rawExpr: t.Node,
  slots: ComponentPropSlots | undefined,
): ParamPropInfo | null {
  if (!slots) return null;
  const expr = unparen(rawExpr);
  if (!expr) return null;

  if (t.isIdentifier(expr)) {
    return slots.paramsByLocalName.get(expr.name) ?? null;
  }

  if (
    slots.propsObjectName &&
    t.isMemberExpression(expr) &&
    !expr.computed &&
    t.isIdentifier(expr.object, { name: slots.propsObjectName }) &&
    t.isIdentifier(expr.property)
  ) {
    const propName = expr.property.name;
    if (FORBIDDEN_PROP_NAMES.has(propName)) return null;
    return { propName, defaultValue: "" };
  }

  if (
    t.isLogicalExpression(expr) &&
    (expr.operator === "??" || expr.operator === "||")
  ) {
    const left = matchPropExpression(expr.left, slots);
    if (left && t.isStringLiteral(expr.right)) {
      return { propName: left.propName, defaultValue: expr.right.value };
    }
  }

  return null;
}

/** Converts collected prop slot bindings into a null-prototype `ComponentPropBinding` dictionary. */
export function toNullProtoPropBindings(
  bindings: ReadonlyMap<string, ComponentPropBinding>,
): Readonly<Record<string, ComponentPropBinding>> {
  const out: Record<string, ComponentPropBinding> = {};
  Object.setPrototypeOf(out, null);
  for (const [propName, binding] of bindings) {
    if (FORBIDDEN_PROP_NAMES.has(propName)) continue;
    out[propName] = binding;
  }
  return out;
}

/**
 * Returns the `export interface <Name>Props` / `type <Name>Props` declaration statement
 * on a `"cp"` master page so `extractPreamble` omits it from `preamble.top`.
 */
export function findComponentPropsStatement(
  program: t.Program,
  componentName: string | undefined,
  rootName: string | undefined,
): t.Statement | null {
  const pascalName = toComponentPascalName(componentName ?? rootName ?? "Component");
  const targetName = `${pascalName}Props`;
  for (const stmt of program.body) {
    const inner =
      t.isExportNamedDeclaration(stmt) && stmt.declaration ? stmt.declaration : stmt;
    if (t.isTSInterfaceDeclaration(inner) && inner.id.name === targetName) {
      return stmt;
    }
    if (t.isTSTypeAliasDeclaration(inner) && inner.id.name === targetName) {
      return stmt;
    }
  }
  return null;
}

function hasDisallowedComponentChildren(node: t.JSXElement): t.Node | null {
  for (const child of node.children) {
    if (t.isJSXText(child)) {
      if (child.value.trim() !== "") return child;
      continue;
    }
    if (t.isJSXExpressionContainer(child)) {
      if (t.isJSXEmptyExpression(child.expression)) continue;
      return child;
    }
    return child;
  }
  return null;
}

function readInstanceAttributes(node: t.JSXElement): Map<string, t.JSXAttribute> {
  const attrs = new Map<string, t.JSXAttribute>();
  for (const attr of node.openingElement.attributes) {
    if (!t.isJSXSpreadAttribute(attr)) {
      attrs.set(attributeName(attr), attr);
    }
  }
  return attrs;
}

function assertInstanceAttributesScoped(
  node: t.JSXElement,
  bound: ReadonlySet<string>,
  staticConsts: ReadonlyMap<string, StaticValue>,
): void {
  for (const attr of node.openingElement.attributes) {
    if (t.isJSXSpreadAttribute(attr)) {
      const bad = findUnboundIdentifier(attr.argument, bound);
      if (bad) {
        throw new CodeError(
          `'${bad.name}' is not defined in this component.`,
          bad.loc ?? attr.loc,
        );
      }
      continue;
    }
    if (
      t.isJSXAttribute(attr) &&
      t.isJSXExpressionContainer(attr.value) &&
      !t.isJSXEmptyExpression(attr.value.expression)
    ) {
      if (evaluateStaticExpression(attr.value.expression, staticConsts).ok) {
        continue;
      }
      const bad = findUnboundIdentifier(attr.value.expression, bound);
      if (bad) {
        throw new CodeError(
          `'${bad.name}' is not defined in this component.`,
          bad.loc ?? attr.loc,
        );
      }
    }
  }
}

function isDynamicExprAttr(
  attr: t.JSXAttribute | undefined,
  staticConsts: ReadonlyMap<string, StaticValue>,
): boolean {
  if (!attr || !t.isJSXExpressionContainer(attr.value)) return false;
  if (t.isJSXEmptyExpression(attr.value.expression)) return false;
  return !evaluateStaticExpression(attr.value.expression, staticConsts).ok;
}

function instanceOwnClasses(
  written: readonly string[],
  existing: EditorElement | undefined,
): string | undefined {
  const derived = new Set(existing ? styleClasses(existing) : []);
  const own = written.filter((cls) => !derived.has(cls));
  const before = existing?.tailwindStyles;
  if (isEqual(own, splitClasses(before))) return before;
  return own.join(" ");
}

export interface ParseComponentInstanceOptions {
  readonly isPending?: boolean;
}

/**
 * Parses a JSX call site of a project `"cp"` component (or pending extracted helper)
 * into a linked `EditorElement` instance with `ComponentOverrides` and preserved placement styles.
 */
export function parseComponentInstance(
  node: t.JSXElement,
  catalogEntry: CatalogComponent,
  parentId: string | undefined,
  ctx: ComponentInstanceParseContext,
  codeVisible?: string,
  options?: ParseComponentInstanceOptions,
): EditorElement {
  const badChild = hasDisallowedComponentChildren(node);
  if (badChild) {
    throw new CodeError(
      `Edit the ${catalogEntry.pascalName} component to change its children.`,
      badChild.loc ?? node.loc,
    );
  }

  const bound = ctx.boundIdentifiers ?? new Set<string>();
  const consts = ctx.staticConsts ?? new Map<string, StaticValue>();
  assertInstanceAttributesScoped(node, bound, consts);

  const attrs = readInstanceAttributes(node);
  const isPending = options?.isPending === true;

  const wantedId = stringAttributeValue(attrs, "data-element-id");
  const found = wantedId ? ctx.byId.get(wantedId) : undefined;
  const existingSetting = found ? componentSetting(found) : undefined;
  const matchesExisting =
    found &&
    !ctx.claimed.has(found.id) &&
    (isPending
      ? found.type === catalogEntry.root.type
      : existingSetting?.pageId === catalogEntry.pageId);
  const existing = matchesExisting ? found : undefined;
  if (existing) ctx.claimed.add(existing.id);

  const pageId = existing ? existing.pageId : ctx.pageId;
  if (!pageId) {
    throw new CodeError("There's no active page to add elements to.", node.loc);
  }

  const dynamicClassName = isDynamicExprAttr(attrs.get("className"), consts);
  const written = dynamicClassName
    ? []
    : splitClasses(stringAttributeValue(attrs, "className", true, consts) ?? "");
  const tailwindStyles = dynamicClassName
    ? existing?.tailwindStyles
    : instanceOwnClasses(written, existing);

  const overrides: ComponentOverrides = {};
  const codeProps: string[] = [];

  for (const attr of node.openingElement.attributes) {
    if (t.isJSXSpreadAttribute(attr)) {
      codeProps.push(generate(attr).code);
      continue;
    }
    const name = attributeName(attr);
    if (name === "data-element-id" || name === "key") continue;
    if (name === "className") {
      if (dynamicClassName) codeProps.push(generate(attr).code);
      continue;
    }
    if (Object.hasOwn(catalogEntry.props, name)) {
      const binding = catalogEntry.props[name];
      if (!binding) continue;
      if (isDynamicExprAttr(attr, consts)) {
        codeProps.push(generate(attr).code);
        continue;
      }
      const val = attributeValue(attr, consts);
      if (val.ok && typeof val.value === "string") {
        if (val.value !== binding.defaultValue) {
          overrides[binding.nodeId] = {
            ...overrides[binding.nodeId],
            [binding.field]: val.value,
          };
        }
        continue;
      }
      codeProps.push(generate(attr).code);
      continue;
    }
    codeProps.push(generate(attr).code);
  }

  const hasOverrides = Object.keys(overrides).length > 0;
  const baseInstance = makeComponentInstance(
    catalogEntry.root,
    pageId,
    hasOverrides ? overrides : undefined,
    existing,
  );

  baseInstance.parentId = parentId;
  if (tailwindStyles !== undefined || existing) {
    baseInstance.tailwindStyles = tailwindStyles;
  }

  const existingSettings = isPlainRecord(existing?.settings) ? existing.settings : null;
  const nextSettings: Record<string, unknown> = {};
  for (const key of HIDDEN_SETTINGS) {
    if (key === "component" || key === "codeProps" || key === "codeVisible") continue;
    if (existingSettings && key in existingSettings) {
      nextSettings[key] = existingSettings[key];
    }
  }
  if (!isPending) {
    const compSetting: ComponentSetting = {
      pageId: catalogEntry.pageId,
      rootId: catalogEntry.root.id,
      ...(hasOverrides ? { overrides } : {}),
    };
    nextSettings.component = compSetting;
  } else {
    ctx.pendingInstances?.push({
      instanceId: baseInstance.id,
      pascalName: catalogEntry.pascalName,
      ...(hasOverrides ? { overrides } : {}),
    });
  }
  if (codeProps.length > 0) {
    nextSettings.codeProps = codeProps;
  }
  const effectiveVisible = codeVisible ?? readCodeVisible(existingSettings);
  if (codeVisible) {
    nextSettings.codeVisible = codeVisible;
  } else if (effectiveVisible && existing && !codeVisible) {
    // Only keep codeVisible when explicitly wrapped in `{cond && ...}` in code.
  }

  if (Object.keys(nextSettings).length === 0) {
    return updateElementSettings(baseInstance, () => null);
  }
  return updateElementSettings(baseInstance, () => nextSettings);
}
