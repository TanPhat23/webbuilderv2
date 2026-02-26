import { EditorElement } from "@/types/global.type";

export interface EditorComponentProps {
  element: EditorElement;
  data?: Record<string, unknown>;
}
