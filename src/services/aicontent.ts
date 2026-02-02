import { URLBuilder } from "@/lib/utils/urlbuilder";
import { API_ENDPOINTS } from "@/constants/endpoints";
import apiClient from "./apiclient";

interface GenerateContentParams {
  prompt: string;
  context?: string;
  includeImages?: boolean;
}

interface GenerateContentResponse {
  content?: string;
  html?: string;
  streaming?: boolean;
}

interface StreamCallback {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

export const aiContentService = {
  async generateContent(
    params: GenerateContentParams,
  ): Promise<GenerateContentResponse> {
    try {
      const url = new URLBuilder("ai")
        .setPath(API_ENDPOINTS.AI.GENERATE_CONTENT)
        .build();
      return await apiClient.post<GenerateContentResponse>(url, params);
    } catch (error) {
      console.error("Failed to generate AI content:", error);
      throw error;
    }
  },

  async generateContentStream(
    params: GenerateContentParams,
    callbacks: StreamCallback,
  ): Promise<void> {
    try {
      const url = new URLBuilder("ai")
        .setPath(API_ENDPOINTS.AI.GENERATE_CONTENT)
        .build();
      const response = await apiClient.post<GenerateContentResponse>(
        url,
        params,
      );

      if (response.content) {
        const content = response.content;
        let streamedContent = "";

        for (let i = 0; i < content.length; i++) {
          streamedContent += content[i];
          callbacks.onChunk?.(streamedContent);

          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        callbacks.onComplete?.(content);
      }
    } catch (error) {
      console.error("Failed to generate AI content:", error);
      callbacks.onError?.(error as Error);
      throw error;
    }
  },
};
