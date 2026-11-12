import type React from "react";
import { useSelectedElement, useUpdateElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useEditorContext } from "@/providers/editorprovider";
import {
  compactStyles,
  withoutKeys,
  type Breakpoint,
  type StyleMap,
} from "./styleModel";

/** The single reader/writer of the selected element's styles at a breakpoint. */
export function useStyleProps(breakpoint: Breakpoint) {
  const element = useSelectedElement();
  const updateElement = useUpdateElement();
  const { editor } = useEditorContext();
  const disabled = Boolean(editor.isReadOnly || editor.isLocked);

  const all = (element?.styles ?? {}) as Partial<Record<Breakpoint, StyleMap>>;
  const values: StyleMap = all[breakpoint] ?? {};
  const inherited: StyleMap =
    breakpoint === "default" ? {} : (all.default ?? {});

  const replace = (next: StyleMap) => {
    if (!element || disabled) return;
    elementHelper.updateElementStyle(
      element,
      compactStyles(next) as React.CSSProperties,
      breakpoint,
      updateElement,
    );
  };

  return {
    element,
    breakpoint,
    values,
    inherited,
    disabled,
    replace,
    set: (k: string, v: string | number | undefined) =>
      replace({ ...values, [k]: v }),
    setMany: (p: StyleMap) => replace({ ...values, ...p }),
    clear: (keys: readonly string[]) => replace(withoutKeys(values, keys)),
  };
}

export type StyleProps = ReturnType<typeof useStyleProps>;
