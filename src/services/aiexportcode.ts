import { URLBuilder } from "@/lib/utils/urlbuilder";
import { AI_EXPORT_ENDPOINTS } from "@/constants/endpoints";
import apiClient from "./apiclient";

export interface FileTreeNode {
  type: "file" | "folder";
  parentPath: string;
  name: string;
  content?: string;
}

export interface ReconstructProjectParams {
  fileTreeData: FileTreeNode[];
}

export interface ReconstructProjectResponse {
  reconstructed: FileTreeNode[];
}

export interface HealthCheckResponse {
  status: string;
  model_loaded: boolean;
}

export const aiExportService = {
  /**
   * Send file tree data to AI Export server for reconstruction
   * Server runs on localhost:5000
   * @param fileTree - Array of file/folder nodes to reconstruct
   * @returns Reconstructed file tree from AI
   */
  async reconstructProject(fileTree: FileTreeNode[]): Promise<FileTreeNode[]> {
    try {
      const url = new URLBuilder("export")
        .setPath(AI_EXPORT_ENDPOINTS.RECONSTRUCT)
        .build();
      const response = await apiClient.post<ReconstructProjectResponse>(url, {
        fileTreeData: fileTree,
      });

      console.log(
        "RECONSTRUCTED DATA:",
        JSON.stringify(response.reconstructed, null, 2),
      );

      return response.reconstructed || [];
    } catch (error) {
      console.error("Failed to reconstruct project:", error);
      throw error;
    }
  },

  /**
   * Check if AI Export server is healthy and available
   * Server runs on localhost:5000
   * @returns Health status
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    try {
      const url = new URLBuilder("export")
        .setPath(AI_EXPORT_ENDPOINTS.HEALTH)
        .build();
      return await apiClient.get<HealthCheckResponse>(url);
    } catch (error) {
      console.error("AI Export server health check failed:", error);
      throw error;
    }
  },
};
