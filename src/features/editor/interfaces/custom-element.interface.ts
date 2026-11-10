import type { ElementTemplate } from "@/types/global.type";

export interface CustomElement {
  id: string;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  thumbnail?: string;
  structure: ElementTemplate;
  tags?: string;
  userId: string;
  isPublic: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
}
