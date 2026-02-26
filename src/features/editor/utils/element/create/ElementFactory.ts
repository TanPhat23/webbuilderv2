import {
  ContainerElement,
  ContainerElementTemplate,
  ContainerElementType,
  EditorElement,
  ElementTemplate,
  ElementType,
} from "@/types/global.type";
import type {
  ResponsiveStyles,
  ElementTypeMap,
} from "@/features/editor";
import { v4 as uuidv4 } from "uuid";
import { getElementStrategy } from "./elementStrategyMap";
import { BuilderState } from "./elementCreateStrategy";
import { SelectionStore } from "@/features/editor";

/**
 * Maps an {@link ElementType} string to its concrete element interface.
 *
 * @example
 * ```ts
 * type Btn = ElementByType<"Button">; // ButtonElement
 * ```
 */
type ElementByType<T extends ElementType> = T extends keyof ElementTypeMap
  ? ElementTypeMap[T]
  : never;

/** Parameters accepted by {@link ElementFactory.createElement}. */
interface CreateElementParams<T extends ElementType = ElementType> {
  readonly type: T;
  readonly pageId: string;
  readonly parentId?: string;
}

type CreateElementResult<T extends ElementType> = ElementByType<T> | undefined;

interface CreateElementFromTemplateParams<T extends ElementType = ElementType> {
  readonly element: ElementTemplate;
  readonly pageId: string;
}

class ElementFactoryError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "MISSING_PAGE_ID"
      | "STRATEGY_FAILED"
      | "BUILD_FAILED",
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ElementFactoryError";
  }
}

/**
 * Singleton factory for creating editor elements with full type safety.
 *
 * Uses the Strategy pattern internally — each {@link ElementType} has a
 * corresponding {@link ElementCreateStrategy} that knows how to produce
 * the correct default values. The factory itself handles ID generation,
 * validation, template recursion, and selection-store side-effects.
 *
 * @example
 * ```ts
 * // Create a simple element
 * const button = ElementFactory.getInstance().createElement({
 *   type: "Button",
 *   pageId: "page-1",
 * });
 *
 * // Create a full component tree from a template
 * const section = ElementFactory.getInstance().createElementFromTemplate({
 *   element: sectionTemplate,
 *   pageId: "page-1",
 * });
 * ```
 */
export class ElementFactory {
  private static instance: ElementFactory;

  private constructor() {}

  /**
   * Returns the singleton {@link ElementFactory} instance.
   *
   * The instance is created lazily on first access.
   */
  static getInstance(): ElementFactory {
    if (!ElementFactory.instance) {
      ElementFactory.instance = new ElementFactory();
    }
    return ElementFactory.instance;
  }

  private generateId(): string {
    return uuidv4();
  }

  private isContainerTemplate(
    t: ElementTemplate,
  ): t is ContainerElementTemplate {
    return (t as Partial<Record<string, unknown>>).hasOwnProperty("elements");
  }

  private validatePageId(pageId: string | undefined): asserts pageId is string {
    if (!pageId || pageId.trim() === "") {
      throw new ElementFactoryError(
        "pageId is required and must not be empty",
        "MISSING_PAGE_ID",
      );
    }
  }

  private buildWithStrategy(options: BuilderState): EditorElement {
    try {
      const strategy = getElementStrategy(options.type);
      const built = strategy.buildElement(options);

      if (!built) {
        throw new ElementFactoryError(
          `Strategy returned null for element type "${options.type}"`,
          "STRATEGY_FAILED",
          { type: options.type, id: options.id },
        );
      }

      return built;
    } catch (error) {
      if (error instanceof ElementFactoryError) {
        throw error;
      }
      throw new ElementFactoryError(
        `Failed to build element for type "${options.type}": ${error instanceof Error ? error.message : "Unknown error"}`,
        "BUILD_FAILED",
        { type: options.type, originalError: error },
      );
    }
  }

  private createBuilderState<T extends ElementType>({
    id,
    type,
    pageId,
    parentId,
    styles,
    tailwindStyles,
    src,
    href,
    content,
  }: {
    id: string;
    type: T;
    pageId: string;
    parentId?: string;
    styles?: ResponsiveStyles;
    tailwindStyles?: string;
    src?: string;
    href?: string;
    content?: string;
  }): BuilderState {
    return {
      id,
      type,
      pageId,
      src: src ?? undefined,
      parentId: parentId && parentId !== "" ? parentId : undefined,
      styles: styles ?? {},
      tailwindStyles: tailwindStyles ?? undefined,
      href: href ?? undefined,
      content: content ?? undefined,
    };
  }

  private mergeSettings(
    strategySettings: unknown,
    templateSettings?: unknown,
  ): unknown {
    if (!templateSettings) {
      return strategySettings;
    }

    if (
      typeof strategySettings === "object" &&
      strategySettings !== null &&
      typeof templateSettings === "object" &&
      templateSettings !== null
    ) {
      return { ...strategySettings, ...templateSettings } as unknown;
    }

    return templateSettings ?? strategySettings;
  }

  /**
   * Create a new element of the specified type with sensible defaults.
   *
   * The created element is automatically set as the selected element in the
   * global {@link SelectionStore}.
   *
   * @typeParam T - The element type literal (e.g. `"Button"`, `"Section"`).
   * @param params - Creation parameters (type, pageId, optional parentId).
   * @returns The newly created element narrowed to `ElementByType<T>`, or
   *          `undefined` if creation failed.
   *
   * @example
   * ```ts
   * const input = ElementFactory.getInstance().createElement({
   *   type: "Input",
   *   pageId: "page-1",
   *   parentId: "form-abc",
   * });
   * ```
   */
  public createElement<T extends ElementType>(
    params: CreateElementParams<T>,
  ): CreateElementResult<T> {
    const { type, pageId, parentId } = params;
    const id = this.generateId();

    try {
      this.validatePageId(pageId);

      const state = this.createBuilderState({
        id,
        type,
        pageId,
        parentId,
      });

      const newElement = this.buildWithStrategy(state);
      SelectionStore.getState().setSelectedElement(
        newElement as ElementByType<T>,
      );

      return newElement as CreateElementResult<T>;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(
        `[ElementFactory.createElement] Failed to create element of type "${type}": ${message}`,
        { type, pageId, parentId, originalError: error },
      );
      return undefined;
    }
  }

  /**
   * Recursively create an element tree from a template definition.
   *
   * Each node in the template receives a fresh UUID. Container templates
   * have their `elements` array recursively instantiated as well. Template
   * `settings` are merged on top of the strategy defaults.
   *
   * The root element is automatically set as the selected element in the
   * global {@link SelectionStore}.
   *
   * @typeParam T - Optional narrowed return type (defaults to `EditorElement`).
   * @param params - Template and target pageId.
   * @returns The fully instantiated root element, or `undefined` on failure.
   *
   * @example
   * ```ts
   * const card = ElementFactory.getInstance().createElementFromTemplate({
   *   element: cardTemplate,
   *   pageId: "page-1",
   * });
   * ```
   */
  public createElementFromTemplate<T extends EditorElement = EditorElement>(
    params: CreateElementFromTemplateParams,
  ): T | undefined {
    const { element: rootTemplate, pageId } = params;

    try {
      this.validatePageId(pageId);

      const recursivelyCreate = (
        tmpl: ElementTemplate,
        parentId?: string,
      ): EditorElement => {
        const id = this.generateId();

        const state = this.createBuilderState({
          id,
          type: tmpl.type,
          pageId,
          parentId,
          styles: tmpl.styles,
          tailwindStyles: tmpl.tailwindStyles,
          src: tmpl.src,
          href: tmpl.href,
          content: tmpl.content,
        });

        const base = this.buildWithStrategy(state);

        if (this.isContainerTemplate(tmpl)) {
          const children = (tmpl as ContainerElementTemplate).elements ?? [];
          const createdChildren = children.map((child) =>
            recursivelyCreate(child, id),
          );
          (base as ContainerElement).elements = createdChildren;
        }

        if (tmpl.settings) {
          base.settings = this.mergeSettings(
            base.settings,
            tmpl.settings,
          ) as any;
        }

        return base;
      };

      const root = recursivelyCreate(rootTemplate, undefined);
      SelectionStore.getState().setSelectedElement(root as T);

      return root as T;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(
        "[ElementFactory.createElementFromTemplate] Failed to create element from template:",
        { pageId, originalError: error, message },
      );
      return undefined;
    }
  }
}

export { ElementFactoryError };
export type { ElementTypeMap };
