import { generate } from "@babel/generator";
import { parse } from "@babel/parser";
import * as t from "@babel/types";
import { elementUtils } from "@webbuilder/site-runtime/elements/lib/elementhelper";
import type { ComponentSetting } from "@webbuilder/site-runtime/projects/components";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { cleanJsxText, type CodeDiagnostic, CodeError, diagnosticAt, unparen } from "./astLiterals";
import {
  EMPTY_COMPONENT_CATALOG,
  lucidePascalToKebab,
  type CatalogComponent,
  type ComponentCatalog,
} from "./catalog";
import {
  extractComponentParamDefaults,
  findComponentPropsStatement,
  toNullProtoPropBindings,
  type ComponentPropSlots,
} from "./codecs/componentCodec";
import type { Preamble } from "./customCode";
import { extractPreamble, locatePage, type LocatedPage } from "./extractPreamble";
import {
  processLocalComponents,
  type ExtractedComponentSpec,
  type PendingComponentInstance,
} from "./normalize/extractComponents";
import { collectShadcnBindings } from "./normalize/shadcnLowering";
import {
  analyzeModuleScope,
  findUnboundIdentifier,
  type ModuleScope,
} from "./normalize/staticScope";
import {
  collectReferencedIdentifiers,
  unrollStaticJsxRoot,
} from "./normalize/unrollStaticJsx";
import {
  convertElement,
  indexById,
  keepUnsupported,
  updateElementSettings,
  type ParseContext,
} from "./parseElements";

export type { CodeDiagnostic } from "./astLiterals";
export type { ExtractedComponentSpec, PendingComponentInstance } from "./normalize/extractComponents";

export interface ParseCodeOptions {
  readonly catalog?: ComponentCatalog;
  readonly mode?: "preview" | "commit";
  readonly isComponentPage?: boolean;
  readonly componentName?: string;
  readonly pageMeta?: {
    readonly isComponentPage?: boolean;
    readonly componentName?: string;
  };
}

export interface ParseCodeSuccess {
  readonly ok: true;
  readonly elements: EditorElement[];
  readonly preamble: Preamble;
  readonly pendingComponentNames: readonly string[];
  readonly extractedComponents: readonly ExtractedComponentSpec[];
  readonly pendingInstances: readonly PendingComponentInstance[];
}

export type ParseCodeResult =
  | ParseCodeSuccess
  | { readonly ok: false; readonly diagnostic: CodeDiagnostic };

function readSyntaxError(err: unknown): { message: string; loc: t.SourceLocation | null } {
  const rawMessage =
    typeof err === "object" && err !== null && "message" in err && typeof err.message === "string"
      ? err.message
      : "Syntax error";
  const message = rawMessage.replace(/\s*\(\d+:\d+\)$/, "");

  if (
    typeof err === "object" &&
    err !== null &&
    "loc" in err &&
    typeof err.loc === "object" &&
    err.loc !== null &&
    "line" in err.loc &&
    "column" in err.loc &&
    typeof err.loc.line === "number" &&
    typeof err.loc.column === "number"
  ) {
    const pos = { line: err.loc.line, column: err.loc.column, index: 0 };
    return { message, loc: { start: pos, end: pos, filename: "", identifierName: undefined } };
  }
  return { message, loc: null };
}

function collectLucideImports(program: t.Program): Map<string, string> {
  const icons = new Map<string, string>();
  for (const stmt of program.body) {
    if (!t.isImportDeclaration(stmt) || stmt.source.value !== "lucide-react") continue;
    for (const spec of stmt.specifiers) {
      if (!t.isImportSpecifier(spec)) continue;
      const imported = t.isIdentifier(spec.imported)
        ? spec.imported.name
        : spec.imported.value;
      const local = spec.local.name;
      icons.set(local, lucidePascalToKebab(imported));
    }
  }
  return icons;
}

interface RootElementEntry {
  readonly node: t.JSXElement;
  readonly codeVisible?: string;
}

function collectRootElements(
  root: t.JSXElement | t.JSXFragment,
  boundIdentifiers: ReadonlySet<string>,
): RootElementEntry[] {
  if (!t.isJSXFragment(root)) return [{ node: root }];
  const entries: RootElementEntry[] = [];
  for (const child of root.children) {
    if (t.isJSXElement(child)) {
      entries.push({ node: child });
    } else if (t.isJSXText(child)) {
      if (cleanJsxText(child.value).trim() !== "") {
        throw new CodeError(
          "Text at the root must sit inside an element like <div> or <section>.",
          child.loc,
        );
      }
    } else if (t.isJSXExpressionContainer(child)) {
      if (t.isJSXEmptyExpression(child.expression)) continue;
      const expr = unparen(child.expression);
      if (expr && t.isLogicalExpression(expr) && expr.operator === "&&") {
        const right = unparen(expr.right);
        if (right && t.isJSXElement(right)) {
          const bad = findUnboundIdentifier(expr.left, boundIdentifiers);
          if (bad) {
            throw new CodeError(
              `'${bad.name}' is not defined in this component.`,
              bad.loc ?? expr.left.loc,
            );
          }
          entries.push({ node: right, codeVisible: generate(expr.left).code });
          continue;
        }
      }
      throw new CodeError(
        "Only elements are supported at the top level of the component.",
        child.loc,
      );
    } else {
      throw new CodeError(
        "Only elements are supported at the top level of the component.",
        child.loc,
      );
    }
  }
  return entries;
}

function collectUiImports(program: t.Program): Set<string> {
  const uiImported = new Set<string>();
  for (const stmt of program.body) {
    if (!t.isImportDeclaration(stmt) || stmt.importKind === "type") continue;
    if (!stmt.source.value.startsWith("@/components/ui/")) continue;
    for (const spec of stmt.specifiers) {
      if (t.isImportSpecifier(spec) && spec.importKind === "type") continue;
      uiImported.add(spec.local.name);
    }
  }
  return uiImported;
}

function collectProjectImportAliases(program: t.Program): Map<string, string> {
  const aliases = new Map<string, string>();
  for (const stmt of program.body) {
    if (!t.isImportDeclaration(stmt) || stmt.importKind === "type") continue;
    const source = stmt.source.value;
    if (!source.startsWith("@/components/") || source.startsWith("@/components/ui/")) {
      continue;
    }
    const moduleLeaf = source.slice(source.lastIndexOf("/") + 1);
    for (const spec of stmt.specifiers) {
      if (t.isImportSpecifier(spec)) {
        if (spec.importKind === "type") continue;
        const imported = t.isIdentifier(spec.imported)
          ? spec.imported.name
          : spec.imported.value;
        aliases.set(spec.local.name, imported);
      } else if (t.isImportDefaultSpecifier(spec) && moduleLeaf) {
        aliases.set(spec.local.name, moduleLeaf);
      }
    }
  }
  return aliases;
}

function collectProjectComponentImports(
  program: t.Program,
  catalog: ComponentCatalog | undefined,
  uiImported: ReadonlySet<string>,
): Set<string> {
  const names = new Set<string>();

  for (const stmt of program.body) {
    if (!t.isImportDeclaration(stmt) || stmt.importKind === "type") continue;
    const source = stmt.source.value;
    if (source.startsWith("@/components/") && !source.startsWith("@/components/ui/")) {
      for (const spec of stmt.specifiers) {
        if (t.isImportSpecifier(spec) && spec.importKind === "type") continue;
        names.add(spec.local.name);
      }
    }
  }

  if (catalog) {
    for (const pascalName of catalog.byPascalName.keys()) {
      if (!uiImported.has(pascalName)) {
        names.add(pascalName);
      }
    }
  }
  return names;
}

function extendCatalogWithEntries(
  base: ComponentCatalog,
  extra: readonly CatalogComponent[],
): ComponentCatalog {
  if (extra.length === 0) return base;
  const list = [...base.list];
  const byPageId = new Map(base.byPageId);
  const byPascalName = new Map(base.byPascalName);
  for (const entry of extra) {
    list.push(entry);
    byPageId.set(entry.pageId, entry);
    byPascalName.set(entry.pascalName, entry);
  }
  return { list, byPageId, byPascalName };
}

function declaredIdentifierNames(stmt: t.Statement): string[] | null {
  const inner =
    t.isExportNamedDeclaration(stmt) && stmt.declaration ? stmt.declaration : stmt;
  if (!t.isVariableDeclaration(inner) || inner.kind !== "const") return null;
  const names: string[] = [];
  for (const decl of inner.declarations) {
    if (!t.isIdentifier(decl.id)) return null;
    names.push(decl.id.name);
  }
  return names.length > 0 ? names : null;
}

function collectOmittedStatements(
  program: t.Program,
  page: LocatedPage,
  scope: ModuleScope,
  activeShadcnTags: ReadonlySet<string>,
  consumedConsts: ReadonlySet<string>,
  normalizedRoot: t.JSXElement | t.JSXFragment,
  extraOmitStatements?: ReadonlySet<t.Statement>,
): {
  readonly omitStatements: Set<t.Statement>;
  readonly retainStatements: Set<t.Statement>;
} {
  const omitted = new Set<t.Statement>(extraOmitStatements);
  const retained = new Set<t.Statement>();
  const candidateVarStmts = new Map<t.Statement, readonly string[]>();
  const otherStatements: t.Statement[] = [];

  for (const stmt of program.body) {
    if (
      stmt === page.statement ||
      omitted.has(stmt) ||
      t.isImportDeclaration(stmt) ||
      t.isExportDefaultDeclaration(stmt)
    ) {
      continue;
    }
    const names =
      consumedConsts.size > 0 && scope.pureStaticStatements.has(stmt)
        ? declaredIdentifierNames(stmt)
        : null;
    if (names && names.every((name) => consumedConsts.has(name))) {
      candidateVarStmts.set(stmt, names);
    } else {
      otherStatements.push(stmt);
    }
  }

  if (page.fn && t.isBlockStatement(page.fn.body)) {
    for (const stmt of page.fn.body.body) {
      if (stmt === page.ret || omitted.has(stmt)) break;
      const names =
        consumedConsts.size > 0 && scope.pureStaticStatements.has(stmt)
          ? declaredIdentifierNames(stmt)
          : null;
      if (names && names.every((name) => consumedConsts.has(name))) {
        candidateVarStmts.set(stmt, names);
      } else {
        otherStatements.push(stmt);
      }
    }
  }

  let changed = true;
  while (changed && candidateVarStmts.size > 0) {
    changed = false;
    const referenced = new Set<string>();
    for (const stmt of otherStatements) {
      collectReferencedIdentifiers(stmt, referenced);
    }
    for (const [stmt, names] of candidateVarStmts) {
      if (names.some((name) => referenced.has(name))) {
        candidateVarStmts.delete(stmt);
        otherStatements.push(stmt);
        changed = true;
      }
    }
  }

  for (const stmt of candidateVarStmts.keys()) {
    omitted.add(stmt);
  }

  const keptRefs = collectReferencedIdentifiers(normalizedRoot);
  for (const stmt of otherStatements) {
    collectReferencedIdentifiers(stmt, keptRefs, { includeJsxTags: true });
  }

  for (const stmt of program.body) {
    if (
      t.isImportDeclaration(stmt) &&
      stmt.importKind !== "type" &&
      stmt.source.value.startsWith("@/components/ui/") &&
      stmt.specifiers.length > 0
    ) {
      const hasKeptRef = stmt.specifiers.some(
        (spec) =>
          !(t.isImportSpecifier(spec) && spec.importKind === "type") &&
          keptRefs.has(spec.local.name),
      );
      if (hasKeptRef) {
        retained.add(stmt);
        continue;
      }
      const canOmit = stmt.specifiers.every(
        (spec) =>
          (t.isImportSpecifier(spec) && spec.importKind === "type") ||
          activeShadcnTags.has(spec.local.name),
      );
      if (canOmit) omitted.add(stmt);
    }
  }

  return { omitStatements: omitted, retainStatements: retained };
}

/**
 * Attaches final `settings.component` links onto placeholder instance elements
 * once newly extracted `"cp"` master pages have been created and assigned IDs.
 */
export function bindExtractedComponentInstances(
  elements: readonly EditorElement[],
  pending: readonly PendingComponentInstance[],
  createdByPascalName: ReadonlyMap<string, { readonly pageId: string; readonly rootId: string }>,
): EditorElement[] {
  let next = [...elements];
  for (const item of pending) {
    const target = createdByPascalName.get(item.pascalName);
    if (!target) continue;
    next = elementUtils.mapUpdateById(next, item.instanceId, (el) => {
      const compSetting: ComponentSetting = {
        pageId: target.pageId,
        rootId: target.rootId,
        ...(item.overrides && Object.keys(item.overrides).length > 0
          ? { overrides: item.overrides }
          : {}),
      };
      return updateElementSettings(el, (prev) => ({
        ...(prev ?? {}),
        component: compSetting,
      }));
    });
  }
  return next;
}

export function parseCode(
  code: string,
  current: EditorElement[],
  pageId: string | undefined,
  opts?: ParseCodeOptions,
): ParseCodeResult {
  let ast: t.File;
  try {
    ast = parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] });
  } catch (err) {
    const { message, loc } = readSyntaxError(err);
    return { ok: false, diagnostic: diagnosticAt(message, loc) };
  }

  const page = locatePage(ast.program);
  if (!page) {
    return {
      ok: false,
      diagnostic: diagnosticAt("No JSX found: the component should return the page's elements."),
    };
  }

  const scope = analyzeModuleScope(ast.program, page.fn);
  const catalog = opts?.catalog ?? EMPTY_COMPONENT_CATALOG;
  const mode = opts?.mode ?? "preview";
  const isComponentPage = opts?.isComponentPage ?? opts?.pageMeta?.isComponentPage ?? false;
  const componentName = opts?.componentName ?? opts?.pageMeta?.componentName;

  const lucideImports = collectLucideImports(ast.program);
  const uiImports = collectUiImports(ast.program);
  const projectImportAliases = collectProjectImportAliases(ast.program);
  const projectComponentImports = collectProjectComponentImports(
    ast.program,
    catalog,
    uiImports,
  );
  const activeShadcnTags = collectShadcnBindings(ast.program, projectComponentImports);

  try {
    if (isComponentPage) {
      if (t.isJSXFragment(page.root)) {
        throw new CodeError(
          "A component master page must return a single root element, not a fragment.",
          page.root.loc,
        );
      }

      const paramDefaults = extractComponentParamDefaults(page.fn, scope.staticConsts);
      const { root: normalizedRoot, consumedConsts } = unrollStaticJsxRoot(
        page.root,
        scope,
        activeShadcnTags,
      );
      const entries = collectRootElements(normalizedRoot, scope.boundIdentifiers);
      if (entries.length !== 1) {
        throw new CodeError(
          "A component master page must return a single root element.",
          normalizedRoot.loc,
        );
      }

      const componentPropSlots: ComponentPropSlots = {
        paramsByLocalName: paramDefaults.paramsByLocalName,
        propsObjectName: paramDefaults.propsObjectName,
        bindings: new Map(),
      };

      const ctx: ParseContext = {
        byId: indexById(current),
        pageId,
        claimed: new Set(),
        lucideImports,
        catalog,
        uiImports,
        projectImportAliases,
        componentPropSlots,
        boundIdentifiers: scope.boundIdentifiers,
        staticConsts: scope.staticConsts,
      };

      const rawRoot = convertElement(entries[0]!.node, undefined, ctx, entries[0]!.codeVisible);
      const propBindings = toNullProtoPropBindings(componentPropSlots.bindings);
      const hasBindings = Object.keys(propBindings).length > 0;
      const updatedRoot = updateElementSettings(rawRoot, (prev) => {
        if (!prev) {
          return hasBindings ? { componentProps: propBindings } : null;
        }
        const next: Record<string, unknown> = { ...prev };
        if (hasBindings) {
          next.componentProps = propBindings;
        } else {
          delete next.componentProps;
        }
        return Object.keys(next).length > 0 ? next : null;
      });

      const extraOmit = new Set<t.Statement>();
      const propsStmt = findComponentPropsStatement(
        ast.program,
        componentName,
        updatedRoot.name,
      );
      if (propsStmt) extraOmit.add(propsStmt);

      const { omitStatements, retainStatements } = collectOmittedStatements(
        ast.program,
        page,
        scope,
        activeShadcnTags,
        consumedConsts,
        normalizedRoot,
        extraOmit,
      );

      return {
        ok: true,
        elements: keepUnsupported([updatedRoot], current),
        preamble: extractPreamble(code, ast.program, page, {
          omitStatements,
          retainStatements,
        }),
        pendingComponentNames: [],
        extractedComponents: [],
        pendingInstances: [],
      };
    }

    const { root: normalizedPageRoot, consumedConsts } = unrollStaticJsxRoot(
      page.root,
      scope,
      activeShadcnTags,
    );

    const localResult = processLocalComponents({
      program: ast.program,
      page,
      normalizedPageRoot,
      mode,
      scope,
      activeShadcnTags,
      catalog,
      lucideImports,
      uiImports,
      projectImportAliases,
    });

    const effectiveCatalog = extendCatalogWithEntries(
      catalog,
      localResult.extraCatalogEntries,
    );
    const pendingInstances: PendingComponentInstance[] = [];

    const ctx: ParseContext = {
      byId: indexById(current),
      pageId,
      claimed: new Set(),
      lucideImports,
      catalog: effectiveCatalog,
      uiImports,
      projectImportAliases,
      pendingComponentNames: localResult.pendingCatalogNames,
      pendingInstances,
      boundIdentifiers: scope.boundIdentifiers,
      staticConsts: scope.staticConsts,
    };

    const elements = collectRootElements(localResult.root, scope.boundIdentifiers).map((entry) =>
      convertElement(entry.node, undefined, ctx, entry.codeVisible),
    );

    const { omitStatements, retainStatements } = collectOmittedStatements(
      ast.program,
      page,
      scope,
      activeShadcnTags,
      consumedConsts,
      localResult.root,
      localResult.omittedHelperStatements,
    );

    return {
      ok: true,
      elements: keepUnsupported(elements, current),
      preamble: extractPreamble(code, ast.program, page, { omitStatements, retainStatements }),
      pendingComponentNames: localResult.pendingComponentNames,
      extractedComponents: localResult.extractedComponents,
      pendingInstances,
    };
  } catch (err) {
    if (err instanceof CodeError) return { ok: false, diagnostic: diagnosticAt(err.message, err.loc) };
    throw err;
  }
}
