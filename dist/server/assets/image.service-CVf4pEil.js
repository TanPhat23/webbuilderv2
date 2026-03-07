import { U as URLBuilder, A as API_ENDPOINTS, a as apiClient, g as getToken } from "./project.service-Bci2lGYe.js";
const imageService = {
  uploadImage: async (file, imageName) => {
    const token = await getToken();
    const formData = new FormData();
    formData.append("image", file);
    if (imageName) formData.append("imageName", imageName);
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.IMAGES.UPLOAD).build();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...token ? { Authorization: `Bearer ${token}` } : {}
      },
      body: formData
    });
    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.status}`);
    }
    return response.json();
  },
  uploadBase64Image: async (base64, imageName) => {
    const data = { base64, imageName };
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.IMAGES.UPLOAD_BASE64).build();
    return apiClient.post(url, data);
  },
  getUserImages: async () => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.IMAGES.GET_USER).build();
    return apiClient.get(url);
  },
  getImageByID: async (id) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.IMAGES.GET_BY_ID(id)).build();
    return apiClient.get(url);
  },
  deleteImage: async (id) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.IMAGES.DELETE(id)).build();
    return apiClient.delete(url);
  }
};
export {
  imageService as i
};
