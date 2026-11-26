import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  buildClearSessionCookie,
  extractAccessTokenFromCookieHeader,
  isSecureRequest,
  supabaseSignOut,
  verifySameOriginRequest,
} from "@webbuilder/site-runtime/supabase-auth";
import { loadProjectAuthConfigForRequest } from "@/server/go-api";

const LogoutBodySchema = z.object({
  projectId: z.string().min(1).max(255),
});

export const Route = createFileRoute("/api/site-auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!verifySameOriginRequest(request)) {
          return Response.json(
            { error: "Cross-site requests are not allowed" },
            { status: 403 },
          );
        }

        let projectId: string;
        try {
          const raw: unknown = await request.json();
          const checked = LogoutBodySchema.safeParse(raw);
          if (!checked.success) {
            return Response.json(
              { error: "projectId is required" },
              { status: 400 },
            );
          }
          projectId = checked.data.projectId;
        } catch {
          return Response.json(
            { error: "Invalid JSON payload" },
            { status: 400 },
          );
        }

        const cfg = await loadProjectAuthConfigForRequest(projectId, request);
        const accessToken = extractAccessTokenFromCookieHeader(
          request.headers.get("cookie"),
          projectId,
        );
        if (cfg && accessToken) {
          await supabaseSignOut(cfg, accessToken);
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
