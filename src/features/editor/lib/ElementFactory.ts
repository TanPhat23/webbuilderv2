import type {
  ContainerElement,
  ContainerElementTemplate,
  EditorElement,
  ElementTemplate,
  ElementType,
} from "@/types/global.type";
import type { ResponsiveStyles, ElementTypeMap } from "@/types/elements";
import { newEntityId } from "@/lib/entity-id";
import { getElementStrategy } from "../utils/element/create/elementStrategyMap";
import type { BuilderState } from "../utils/element/create/elementCreateStrategy";
import { SelectionStore } from "../store/selection-store";

type ElementByType<T extends ElementType> = T extends keyof ElementTypeMap
  ? ElementTypeMap[T]
  : never;

interface CreateElementParams<T extends ElementType = ElementType> {
  readonly type: T;
  readonly pageId: string;
  readonly parentId?: string;
}

type CreateElementResult<T extends ElementType> = ElementByType<T> | undefined;

interface CreateElementFromTemplateParams {
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

export class ElementFactory {
  private static instance: ElementFactory;

  private constructor() {}

  static getInstance(): ElementFactory {
    if (!ElementFactory.instance) {
      ElementFactory.instance = new ElementFactory();
    }
    return ElementFactory.instance;
  }

  private generateId(): string {
    return newEntityId();
  }

  private isContainerTemplate(
    t: ElementTemplate,
  ): t is ContainerElementTemplate {
    return Object.prototype.hasOwnProperty.call(t, "elements");
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
      return { ...strategySettings, ...templateSettings };
    }

    return templateSettings ?? strategySettings;
  }

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
          const children = tmpl.elements ?? [];
          const createdChildren = children.map((child) =>
            recursivelyCreate(child, id),
          );
          (base as ContainerElement).elements = createdChildren;
        }

        if (tmpl.settings) {
          Object.assign(base, {
            settings: this.mergeSettings(base.settings, tmpl.settings),
          });
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
