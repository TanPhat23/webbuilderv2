import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  buildClearSessionCookie,
  isSecureRequest,
  loadProjectAuthConfigForSite,
  readCookieFromHeader,
  safeCookieName,
  supabaseSignOut,
  verifySameOriginRequest,
} from "@/features/preview/lib/supabase-site-auth.server";

const LogoutBodySchema = z.object({
  projectId: z.string().min(1).max(255),
});

export const Route = createFileRoute("/api/site-auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!verifySameOriginRequest(request)) {
          return Response.json({ error: "Cross-site requests are not allowed" }, { status: 403 });
        }

        let projectId: string;
        try {
          const raw: unknown = await request.json();
          const checked = LogoutBodySchema.safeParse(raw);
          if (!checked.success) {
            return Response.json({ error: "projectId is required" }, { status: 400 });
          }
          projectId = checked.data.projectId;
        } catch {
          return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const cfg = await loadProjectAuthConfigForSite(projectId);
        const rawCookie = readCookieFromHeader(
          request.headers.get("cookie"),
          safeCookieName(projectId),
        );
        if (cfg && rawCookie) {
          try {
            const parsed: unknown = JSON.parse(
              Buffer.from(rawCookie, "base64url").toString("utf8"),
            );
            if (
              parsed !== null &&
              typeof parsed === "object" &&
              "a" in parsed &&
              typeof (parsed as Record<string, unknown>).a === "string"
            ) {
              await supabaseSignOut(cfg, (parsed as Record<string, string>).a);
            }
          } catch {
            // Ignore malformed cookie; clear it below.
          }
        }

        return Response.json(
          { ok: true },
          {
            status: 200,
            headers: {
              "Set-Cookie": buildClearSessionCookie(
                projectId,
                isSecureRequest(request),
              ),
              "Cache-Control": "private, no-store",
            },
          },
        );
      },
    },
  },
});
