import { URLBuilder } from "@/lib/utils/urlbuilder";
import { NEXT_API_ENDPOINTS } from "@/constants/endpoints";

export default async function getToken(): Promise<string> {
  const url = new URLBuilder("next")
    .setPath(NEXT_API_ENDPOINTS.TOKEN.GET)
    .build();

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    console.error(
      "[getToken] Failed to get authentication token. Status:",
      response.status,
    );
    throw new Error("Failed to get authentication token");
  }

  const { tokenJWT } = await response.json();
  return tokenJWT;
}
