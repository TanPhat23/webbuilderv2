import { EditorElement } from "@/types/global.type";
import { URLBuilder } from "@/utils/urlbuilder";
import apiClient from "@/services/apiclient";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";
import { Snapshot } from "@/features/editor";

export const elementService = {
  getElements: async (projectId: string): Promise<EditorElement[]> => {
    return apiClient.get<EditorElement[]>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.ELEMENTS.GET(projectId))
        .build(),
    );
  },

  getElementsPublic: async (projectId: string): Promise<EditorElement[]> => {
    return apiClient.getPublic<EditorElement[]>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.ELEMENTS.GET_PUBLIC(projectId))
        .build(),
    );
  },

  saveSnapshot: async (
    projectId: string,
    snapshot: Snapshot,
  ): Promise<void> => {
    try {
      await apiClient.post(
        new URLBuilder("api")
          .setPath(API_ENDPOINTS.SNAPSHOTS.SAVE(projectId))
          .build(),
        snapshot,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`saveSnapshot failed: ${message}`);
    }
  },

  getSnapshots: async (projectId: string): Promise<Snapshot[]> => {
    return apiClient.get<Snapshot[]>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.SNAPSHOTS.GET(projectId))
        .build(),
    );
  },

  loadSnapshot: async (
    projectId: string,
    snapshotId: string,
  ): Promise<EditorElement[]> => {
    const snapshot = await apiClient.get<Snapshot>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.SNAPSHOTS.LOAD(projectId, snapshotId))
        .build(),
    );
    return snapshot.elements;
  },

  generateCode: async (
    elements: EditorElement[],
    options: RequestInit = {},
  ): Promise<{ code: string }> => {
    return apiClient.post<{ code: string }>(
      new URLBuilder("next").setPath("/api/generate-code").build(),
      { elements },
      options,
    );
  },
};
