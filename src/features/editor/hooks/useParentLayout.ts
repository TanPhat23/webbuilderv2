import { useElementStore } from "@/features/editor/store/element-store";
import { elementUtils } from "@/features/elements/lib/elementhelper";
import {
  parentLayout,
  type ParentLayout,
} from "@/features/editor/utils/element/sizing";
import type { EditorElement } from "@/types/global.type";

/** How the element's parent lays out its children (row, column or block). */
export function useParentLayout(
  element: EditorElement | undefined,
): ParentLayout {
  const parent = useElementStore((s) =>
    element?.parentId
      ? elementUtils.findById(s.elements, element.parentId)
      : undefined,
  );
  return parentLayout(parent);
}
