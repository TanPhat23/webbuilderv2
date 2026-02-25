import { useCallback, useState } from "react";
import { useCustomElementStore } from "@/globalstore/custom-element-store";
import { customElementService } from "@/services/customElement";
import type { EditorElement } from "@/types/global.type";
import type { ElementTemplate } from "@/types/global.type";

function elementToTemplate(element: EditorElement): ElementTemplate {
  const { pageId: _pageId, ...rest } = element as EditorElement & {
    pageId: string;
  };

  const children = (element as { elements?: EditorElement[] }).elements;

  return {
    ...rest,
    ...(children && children.length > 0
      ? { elements: children.map(elementToTemplate) }
      : {}),
  } as unknown as ElementTemplate;
}

type SaveAsComponentOptions = {
  name: string;
  description?: string;
  category?: string;
  tags?: string;
  isPublic?: boolean;
};

type UseSaveAsComponentReturn = {
  isSaving: boolean;
  save: (element: EditorElement, options: SaveAsComponentOptions) => Promise<void>;
};

export function useSaveAsComponent(): UseSaveAsComponentReturn {
  const [isSaving, setIsSaving] = useState(false);
  const { addUserComponent } = useCustomElementStore();

  const save = useCallback(
    async (element: EditorElement, options: SaveAsComponentOptions) => {
      setIsSaving(true);
      try {
        const structure = elementToTemplate(element);
        const created = await customElementService.create({
          name: options.name,
          description: options.description,
          category: options.category,
          tags: options.tags,
          isPublic: options.isPublic ?? false,
          structure,
        });
        addUserComponent(created);
      } finally {
        setIsSaving(false);
      }
    },
    [addUserComponent],
  );

  return { isSaving, save };
}
