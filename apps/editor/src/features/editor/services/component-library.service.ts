import apiClient from "@/services/apiclient";
import { URLBuilder } from "@/utils/urlbuilder";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";
import { ALL_ELEMENT_TYPES } from "@/features/editor/constants/elements";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";

export interface ComponentSnapshot {
  id: string;
  name: string;
  description?: string;
  structure: EditorElement;
}

export const componentLibraryKey = (userId: string | null) => ["component-library", userId] as const;
const endpoint = (path: string) => new URLBuilder("api").setPath(path).build();

export const componentLibraryService = {
  async list() {
    const saved = await apiClient.get<ComponentSnapshot[]>(endpoint(API_ENDPOINTS.CUSTOM_ELEMENTS.GET_ALL));
    return (saved ?? []).filter((entry) => typeof entry.id === "string" && typeof entry.name === "string");
  },
  save(name: string, description: string, structure: EditorElement) {
    return apiClient.post(endpoint(API_ENDPOINTS.CUSTOM_ELEMENTS.CREATE), {
      name, description, structure, isPublic: false, version: "1.0.0",
    });
  },
  delete(id: string) {
    return apiClient.delete(endpoint(API_ENDPOINTS.CUSTOM_ELEMENTS.DELETE(encodeURIComponent(id))));
  },
};

export function isComponentSnapshot(value: unknown): value is EditorElement {
  let count = 0;
  const validate = (node: unknown, depth: number): boolean => {
    if (!node || typeof node !== "object" || depth > 100 || ++count > 2_000) return false;
    const element = node as EditorElement & { elements?: unknown };
    return typeof element.id === "string" && typeof element.content === "string" &&
      ALL_ELEMENT_TYPES.includes(element.type) &&
      (element.elements === undefined || (Array.isArray(element.elements) &&
        element.elements.every((child) => validate(child, depth + 1))));
  };
  return validate(value, 0);
}
