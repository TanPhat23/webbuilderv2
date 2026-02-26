import { URLBuilder } from "@/utils/urlbuilder";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";
import apiClient from "@/services/apiclient";

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

interface IUserService {
  searchUsers: (
    query: string,
    limit?: number,
    offset?: number,
  ) => Promise<User[]>;
  getUserByEmail: (email: string) => Promise<User>;
  getUserByUsername: (username: string) => Promise<User>;
}

export const userService: IUserService = {
  searchUsers: async (
    query: string,
    limit = 20,
    offset = 0,
  ): Promise<User[]> => {
    try {
      console.log("User search params:", { query, limit, offset });
      const url = new URLBuilder("api")
        .setPath(API_ENDPOINTS.USERS.SEARCH)
        .addQueryParam("q", query)
        .addQueryParam("limit", limit.toString())
        .addQueryParam("offset", offset.toString())
        .build();
      console.log("User search URL:", url);
      const response = await apiClient.get<User[]>(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.warn(`Failed to search users with query ${query}:`, error);
      return [];
    }
  },

  getUserByEmail: async (email: string): Promise<User> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.USERS.GET_BY_EMAIL(email))
      .build();
    return apiClient.get<User>(url);
  },

  getUserByUsername: async (username: string): Promise<User> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.USERS.GET_BY_USERNAME(username))
      .build();
    return apiClient.get<User>(url);
  },
};
