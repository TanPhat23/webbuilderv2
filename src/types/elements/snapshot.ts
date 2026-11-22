import type { EditorElement } from "./elements";

export interface Snapshot {
  id: string;
  elements: EditorElement[];
  type: "working" | "version";
  name: string;
  timestamp: number;
  createdAt: string;
}
