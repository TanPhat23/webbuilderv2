import type { ElementType } from "@/features/editor/constants/elements";
import elementHolders from "@/features/editor/constants/elements";

export interface ElementCategoryDefinition {
  readonly id: string;
  readonly label: string;
  readonly elements: readonly ElementType[];
}

export const ELEMENT_CATEGORIES = [
  {
    id: "structure",
    label: "Structure",
    elements: [
      "Container" as ElementType, // For backward compatibility / alias if used
      "Section",
      "Frame",
      "Grid" as ElementType,
      "Columns" as ElementType,
      "Article",
      "Aside",
      "Header",
      "Footer",
      "Nav",
    ],
  },
  {
    id: "typography",
    label: "Typography",
    elements: [
      "Heading",
      "Text",
      "Span",
      "Label",
      "Blockquote",
      "Code",
      "Link",
    ],
  },
  {
    id: "media",
    label: "Media & Embed",
    elements: [
      "Image",
      "Video",
      "Audio",
      "Icon",
      "IFrame",
      "Separator",
    ],
  },
  {
    id: "forms",
    label: "Forms & Inputs",
    elements: [
      "Button",
      "Input",
      "Form",
      "Checkbox",
      "Radio",
      "Select",
      "Textarea",
      "Progress",
    ],
  },
  {
    id: "data",
    label: "Data & CMS",
    elements: [
      "CMSContentGrid",
      "CMSContentItem",
      "CMSContentList",
      "Carousel",
      "Table",
      "List",
    ],
  },
] as const satisfies readonly ElementCategoryDefinition[];

export type ElementCategoryId = (typeof ELEMENT_CATEGORIES)[number]["id"];

/**
 * Filter valid elements configured for a given category key that exist in elementHolders
 */
export function getElementsForCategory(categoryKey: string): typeof elementHolders {
  const category = ELEMENT_CATEGORIES.find(
    (cat) => cat.id === categoryKey || cat.label.toLowerCase() === categoryKey.toLowerCase(),
  );
  if (!category) {
    return [];
  }

  const allowedTypes = new Set<string>(category.elements);
  return elementHolders.filter((holder) => allowedTypes.has(holder.type));
}
