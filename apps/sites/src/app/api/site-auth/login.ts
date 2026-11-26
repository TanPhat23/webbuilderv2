import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { sanitizeRedirectPath } from "@webbuilder/site-runtime/auth";
import {
  buildSessionSetCookie,
  checkAuthRateLimit,
  isSecureRequest,
  supabaseSignInWithPassword,
  verifySameOriginRequest,
} from "@webbuilder/site-runtime/supabase-auth";
import { loadProjectAuthConfigForRequest } from "@/server/go-api";

const LoginBodySchema = z.object({
  projectId: z.string().min(1).max(255),
  email: z.string().trim().email("Please enter a valid email address").max(320),
  password: z.string().min(1, "Password is required").max(512),
  next: z.string().max(512).optional(),
});

export const Route = createFileRoute("/api/site-auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!verifySameOriginRequest(request)) {
          return Response.json(
            { error: "Cross-site requests are not allowed" },
            { status: 403 },
          );
        }

        let parsedBody: z.infer<typeof LoginBodySchema>;
        try {
          const raw: unknown = await request.json();
          const checked = LoginBodySchema.safeParse(raw);
          if (!checked.success) {
            return Response.json(
              {
                error:
                  checked.error.issues[0]?.message ?? "Invalid login request",
              },
              { status: 400 },
            );
          }
          parsedBody = checked.data;
        } catch {
          return Response.json(
            { error: "Invalid JSON payload" },
            { status: 400 },
          );
        }

        if (!checkAuthRateLimit(request, parsedBody.projectId, "login")) {
          return Response.json(
            { error: "Too many login attempts. Please try again shortly." },
            { status: 429 },
          );
        }

        const cfg = await loadProjectAuthConfigForRequest(
          parsedBody.projectId,
          request,
        );
        if (!cfg) {
          return Response.json(
            { error: "Supabase Auth is not configured for this site." },
            { status: 400 },
          );
        }

        const result = await supabaseSignInWithPassword(
          cfg,
          parsedBody.email,
          parsedBody.password,
        );
        if (!result.ok) {
          return Response.json(
            { error: result.message },
            { status: result.status },
          );
        }

        const redirectTo = sanitizeRedirectPath(
          parsedBody.next,
          cfg.afterLoginPath ?? "/",
        );
        const cookie = buildSessionSetCookie(
          parsedBody.projectId,
          result.session,
          isSecureRequest(request),
        );

        return Response.json(
          { ok: true, user: result.session.user, redirectTo },
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
