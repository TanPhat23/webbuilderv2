// src/features/interactions/describe.ts
/**
 * One compact read of a page for an agent: every element (flat, with parent
 * and child ids), its interactions, and the variables and flows in scope.
 */
import type { EditorElement } from "@/types/global.type";
import type { InteractionMap, Step } from "./schema";
import type { VariableDef } from "./runtime/variables";
import { getInteractions } from "./ops";

export interface DescribedElement {
  id: string;
  type: string;
  name?: string;
  parentId: string | null;
  children: string[];
  text?: string;
  interactions?: InteractionMap;
}

export interface Description {
  pageId: string;
  elements: DescribedElement[];
  variables: Record<string, VariableDef>;
  flows: Record<string, { do: Step[] }>;
}

const childrenOf = (el: EditorElement): EditorElement[] => {
  const kids = (el as unknown as { elements?: unknown }).elements;
  return Array.isArray(kids) ? (kids as EditorElement[]) : [];
};

export function describe(
  pageId: string,
  tree: EditorElement[],
  logic: { variables?: Record<string, VariableDef>; flows?: Record<string, { do: Step[] }> } = {},
): Description {
  const elements: DescribedElement[] = [];
  const visit = (list: EditorElement[], parentId: string | null) => {
    for (const el of list) {
      const kids = childrenOf(el);
      const text =
        typeof el.content === "string"
          ? el.content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 60)
          : "";
      const interactions = getInteractions(el);
      elements.push({
        id: el.id,
        type: el.type,
        ...(el.name ? { name: el.name } : {}),
        parentId,
        children: kids.map((k) => k.id),
        ...(text ? { text } : {}),
        ...(Object.keys(interactions).length ? { interactions } : {}),
      });
      visit(kids, el.id);
    }
  };
  visit(tree, null);
  return { pageId, elements, variables: logic.variables ?? {}, flows: logic.flows ?? {} };
}
