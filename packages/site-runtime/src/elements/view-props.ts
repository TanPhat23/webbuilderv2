import type { HTMLAttributes, ReactNode } from "react";
import type { EditorElement } from "../types/global.type";

export type ViewRootProps = HTMLAttributes<HTMLElement> & Record<string, unknown>;

export interface ViewProps<E extends EditorElement = EditorElement> {
  element: E;
  rootProps: ViewRootProps;
  children?: ReactNode;
  data?: Record<string, unknown>;
  mode: "edit" | "preview";
}
