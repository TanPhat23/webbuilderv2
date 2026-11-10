import { URLBuilder } from "@/utils/urlbuilder";
import type { Image, ImageUploadResponse } from "../interfaces/image.interface";
import apiClient from "@/services/apiclient";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";
import getToken from "@/services/token";

interface IImageService {
  uploadImage: (file: File, imageName?: string) => Promise<ImageUploadResponse>;
  getUserImages: () => Promise<Image[]>;
  deleteImage: (id: string) => Promise<boolean>;
}

export const imageService: IImageService = {
  uploadImage: async (
    file: File,
    imageName?: string,
  ): Promise<ImageUploadResponse> => {
    const token = await getToken();
    const formData = new FormData();
    formData.append("image", file);
    if (imageName) formData.append("imageName", imageName);

    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.IMAGES.UPLOAD)
      .build();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.status}`);
    }

    return response.json();
  },

  getUserImages: async (): Promise<Image[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.IMAGES.GET_USER)
      .build();
    return apiClient.get<Image[]>(url);
  },

  deleteImage: async (id: string): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.IMAGES.DELETE(id))
      .build();
    return apiClient.delete(url);
  },
};
