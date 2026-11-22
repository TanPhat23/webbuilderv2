import { EditorElement } from "@/types/global.type";
import { URLBuilder } from "@/utils/urlbuilder";
import apiClient from "@/services/apiclient";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";
import type { Snapshot } from "../interfaces/snapshot.interface";

/** Mirrors maxPageIDsPerRequest in the API element handler. */
const MAX_PAGE_IDS = 100;

export const elementService = {
  getElements: async (projectId: string, token?: string): Promise<EditorElement[]> => {
    return apiClient.get<EditorElement[]>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.ELEMENTS.GET(projectId))
        .build(),
      undefined,
      token,
    );
  },

  /**
   * Elements of some pages of one project. Much cheaper than getElements when
   * only a few pages matter (e.g. the component masters). The API takes at most
   * MAX_PAGE_IDS ids per request, so longer lists are split and fetched together.
   */
  getElementsByPages: async (projectId: string, pageIds: string[], token?: string): Promise<EditorElement[]> => {
    const chunks: string[][] = [];
    for (let i = 0; i < pageIds.length; i += MAX_PAGE_IDS) chunks.push(pageIds.slice(i, i + MAX_PAGE_IDS));
    const results = await Promise.all(chunks.map((chunk) =>
      apiClient.get<EditorElement[]>(
        new URLBuilder("api")
          .setPath(API_ENDPOINTS.ELEMENTS.GET_BY_PAGES)
          .addQueryParam("projectId", projectId)
          .addQueryParam("pageIds", chunk.join(","))
          .build(),
        undefined,
        token,
      ),
    ));
    return results.flat();
  },

  getElementsPublic: async (projectId: string, { previewCache = false } = {}): Promise<EditorElement[]> => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENTS.GET_PUBLIC(projectId));
    if (previewCache) url.addQueryParam("previewCache", "1");
    return apiClient.getPublic<EditorElement[]>(url.build());
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
    logic?: { variables: unknown; flows: unknown },
    preamble?: { imports: string; top: string; body: string },
  ): Promise<{ code: string; interactions?: string | null }> => {
    return apiClient.post<{ code: string; interactions?: string | null }>(
      new URLBuilder("next").setPath("/api/generate-code").build(),
      { elements, ...(logic ? { logic } : {}), ...(preamble ? { preamble } : {}) },
      options,
    );
  },
};
