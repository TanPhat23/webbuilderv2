import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { sanitizeRedirectPath } from "@/lib/site-auth";
import {
  buildSessionSetCookie,
  checkAuthRateLimit,
  isSecureRequest,
  loadProjectAuthConfigForSite,
  supabaseGetUser,
  verifySameOriginRequest,
} from "@/features/preview/lib/supabase-site-auth.server";

const SessionHandoffSchema = z.object({
  projectId: z.string().min(1).max(255),
  accessToken: z.string().min(10).max(4096),
  refreshToken: z.string().max(4096).optional(),
  expiresIn: z.number().int().positive().max(86400 * 30).optional(),
  next: z.string().max(512).optional(),
});

export const Route = createFileRoute("/api/site-auth/session")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!verifySameOriginRequest(request)) {
          return Response.json({ error: "Cross-site requests are not allowed" }, { status: 403 });
        }

        let body: z.infer<typeof SessionHandoffSchema>;
        try {
          const raw: unknown = await request.json();
          const checked = SessionHandoffSchema.safeParse(raw);
          if (!checked.success) {
            return Response.json({ error: "Invalid session payload" }, { status: 400 });
          }
          body = checked.data;
        } catch {
          return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        if (!checkAuthRateLimit(request, body.projectId, "session")) {
          return Response.json({ error: "Too many requests" }, { status: 429 });
        }

        const cfg = await loadProjectAuthConfigForSite(body.projectId);
        if (!cfg) {
          return Response.json(
            { error: "Supabase Auth is not configured for this site." },
            { status: 400 },
          );
        }

        const verifiedUser = await supabaseGetUser(cfg, body.accessToken);
        if (!verifiedUser) {
          return Response.json({ error: "Invalid or expired session token" }, { status: 401 });
        }

        const redirectTo = sanitizeRedirectPath(
          body.next,
          cfg.afterLoginPath ?? "/",
        );
        const cookie = buildSessionSetCookie(
          body.projectId,
          {
            accessToken: body.accessToken,
            refreshToken: body.refreshToken,
            expiresIn: body.expiresIn,
          },
          isSecureRequest(request),
        );

        return Response.json(
          { ok: true, user: verifiedUser, redirectTo },
          {
            status: 200,
            headers: {
              "Set-Cookie": cookie,
              "Cache-Control": "private, no-store",
            },
          },
        );
      },
    },
  },
});
