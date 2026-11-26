import { auth } from "@clerk/tanstack-react-start/server";

export async function getAuthToken(): Promise<{ userId: string; token: string }> {
  const { userId, getToken } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const token = await getToken();

  if (!token) {
    throw new Error("Failed to retrieve auth token");
  }

  return { userId, token };
}