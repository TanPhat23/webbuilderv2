import { auth, clerkClient } from "@clerk/nextjs/server";

// In-memory cache for tokens with short TTL to match JWT lifetime
interface CachedToken {
  jwt: string;
  expiresAt: number;
}

const tokenCache = new Map<string, CachedToken>();
const CACHE_TTL_MS = 45 * 1000;

function getCachedToken(sessionId: string): string | null {
  const cached = tokenCache.get(sessionId);
  if (!cached) return null;

  // Check if token has expired (with safety buffer)
  if (Date.now() > cached.expiresAt) {
    tokenCache.delete(sessionId);
    return null;
  }

  return cached.jwt;
}

function setCachedToken(sessionId: string, jwt: string): void {
  tokenCache.set(sessionId, {
    jwt,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

// Cleanup expired tokens every 2 minutes
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [sessionId, cached] of tokenCache.entries()) {
    if (now > cached.expiresAt) {
      tokenCache.delete(sessionId);
    }
  }
}

// Run cleanup periodically
setInterval(cleanupExpiredTokens, 2 * 60 * 1000);

export async function GET() {
  try {
    const { sessionId } = await auth();
    if (!sessionId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check cache first (only valid for 45 seconds)
    const cachedJWT = getCachedToken(sessionId);
    if (cachedJWT) {
      return Response.json(
        { tokenJWT: cachedJWT },
        {
          headers: {
            "Cache-Control": "private, no-cache", // Don't cache in browser due to short lifetime
            "X-Cache": "HIT",
          },
        },
      );
    }

    // Fetch new token if not cached or expired
    const client = await clerkClient();
    const token = await client.sessions.getToken(sessionId, "usertemp");

    if (!token?.jwt) {
      return new Response("Failed to get token", { status: 500 });
    }

    // Cache the token for 45 seconds
    // console.log("Caching token for session:", sessionId);
    
    setCachedToken(sessionId, token.jwt);
    // console.log("Token retrieved and cached for session:", token.jwt);
    return Response.json(
      { tokenJWT: token.jwt },
      {
        headers: {
          "Cache-Control": "private, no-cache", // Don't cache in browser
          "X-Cache": "MISS",
        },
      },
    );
  } catch (error) {
    console.error("Token retrieval error:", error);
    return new Response("Failed to get token", { status: 500 });
  }
}
