import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@clerk/tanstack-react-start/server";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

interface CachedToken {
  jwt: string;
  expiresAt: number;
}

const tokenCache = new Map<string, CachedToken>();
const CACHE_TTL_MS = 45 * 1000;

function getCachedToken(sessionId: string): string | null {
  const cached = tokenCache.get(sessionId);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    tokenCache.delete(sessionId);
    return null;
  }
  return cached.jwt;
}

function setCachedToken(sessionId: string, jwt: string): void {
  tokenCache.set(sessionId, { jwt, expiresAt: Date.now() + CACHE_TTL_MS });
}

setInterval(() => {
  const now = Date.now();
  for (const [sessionId, cached] of tokenCache.entries()) {
    if (now > cached.expiresAt) tokenCache.delete(sessionId);
  }
}, 2 * 60 * 1000);

export const Route = createFileRoute("/api/gettoken")({
  server: {
    handlers: {
      GET: async () => {
        const { sessionId } = await auth();

        if (!sessionId) {
          return new Response("Unauthorized", { status: 401 });
        }

        const cachedJWT = getCachedToken(sessionId);
        if (cachedJWT) {
          return Response.json(
            { tokenJWT: cachedJWT },
            { headers: { "Cache-Control": "private, no-cache", "X-Cache": "HIT" } },
          );
        }

        try {
          const token = await clerkClient.sessions.getToken(sessionId, "usertemp");

          if (!token?.jwt) {
            return new Response("Failed to get token", { status: 500 });
          }

          setCachedToken(sessionId, token.jwt);

          return Response.json(
            { tokenJWT: token.jwt },
            { headers: { "Cache-Control": "private, no-cache", "X-Cache": "MISS" } },
          );
        } catch (error) {
          console.error("Token retrieval error:", error);
          return new Response("Failed to get token", { status: 500 });
        }
      },
    },
  },
});