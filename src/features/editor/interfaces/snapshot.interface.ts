import { EditorElement } from "@/types/global.type";

export interface Snapshot {
  id: string;
  elements: EditorElement[];
  type: "working" | "version";
  name: string;
  timestamp: number;
  createdAt: string;
}
