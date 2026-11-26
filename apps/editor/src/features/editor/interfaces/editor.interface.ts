import { EditorElement } from "@webbuilder/site-runtime/types/global.type";

export interface EditorComponentProps {
  element: EditorElement;
  data?: Record<string, unknown>;
}
