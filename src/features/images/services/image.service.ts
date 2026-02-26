import { URLBuilder } from "@/utils/urlbuilder";
import { Image, ImageUploadResponse } from "@/features/images";
import apiClient from "@/services/apiclient";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";
import getToken from "@/services/token";

interface IImageService {
  uploadImage: (file: File, imageName?: string) => Promise<ImageUploadResponse>;
  uploadBase64Image: (
    base64: string,
    imageName?: string,
  ) => Promise<ImageUploadResponse>;
  getUserImages: () => Promise<Image[]>;
  getImageByID: (id: string) => Promise<Image>;
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

  uploadBase64Image: async (
    base64: string,
    imageName?: string,
  ): Promise<ImageUploadResponse> => {
    const data = { base64, imageName };
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.IMAGES.UPLOAD_BASE64)
      .build();
    return apiClient.post<ImageUploadResponse>(url, data);
  },

  getUserImages: async (): Promise<Image[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.IMAGES.GET_USER)
      .build();
    return apiClient.get<Image[]>(url);
  },

  getImageByID: async (id: string): Promise<Image> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.IMAGES.GET_BY_ID(id))
      .build();
    return apiClient.get<Image>(url);
  },

  deleteImage: async (id: string): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.IMAGES.DELETE(id))
      .build();
    return apiClient.delete(url);
  },
};
