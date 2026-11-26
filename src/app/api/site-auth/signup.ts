import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { sanitizeRedirectPath } from "@/lib/site-auth";
import {
  buildMagicLinkCallbackUrl,
  buildSessionSetCookie,
  checkAuthRateLimit,
  isSecureRequest,
  loadProjectAuthConfigForSite,
  supabaseSignUp,
  verifySameOriginRequest,
} from "@/features/preview/lib/supabase-site-auth.server";

const SignupBodySchema = z.object({
  projectId: z.string().min(1).max(255),
  email: z.string().trim().email("Please enter a valid email address").max(320),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(512),
  name: z.string().trim().max(160).optional(),
  next: z.string().max(512).optional(),
});

export const Route = createFileRoute("/api/site-auth/signup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!verifySameOriginRequest(request)) {
          return Response.json({ error: "Cross-site requests are not allowed" }, { status: 403 });
        }

        let parsedBody: z.infer<typeof SignupBodySchema>;
        try {
          const raw: unknown = await request.json();
          const checked = SignupBodySchema.safeParse(raw);
          if (!checked.success) {
            return Response.json(
              { error: checked.error.issues[0]?.message ?? "Invalid signup request" },
              { status: 400 },
            );
          }
          parsedBody = checked.data;
        } catch {
          return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        if (!checkAuthRateLimit(request, parsedBody.projectId, "signup")) {
          return Response.json(
            { error: "Too many sign-up attempts. Please try again shortly." },
            { status: 429 },
          );
        }

        const cfg = await loadProjectAuthConfigForSite(parsedBody.projectId);
        if (!cfg) {
          return Response.json(
            { error: "Supabase Auth is not configured for this site." },
            { status: 400 },
          );
        }

        const redirectTo = sanitizeRedirectPath(
          parsedBody.next,
          cfg.afterLoginPath ?? "/",
        );
        const callbackUrl = buildMagicLinkCallbackUrl(
          request,
          parsedBody.projectId,
          redirectTo,
        );
        const result = await supabaseSignUp(
          cfg,
          parsedBody.email,
          parsedBody.password,
          parsedBody.name,
          callbackUrl,
        );
        if (!result.ok) {
          return Response.json({ error: result.message }, { status: result.status });
        }

        const headers: Record<string, string> = {
          "Cache-Control": "private, no-store",
        };
        if (result.session) {
          headers["Set-Cookie"] = buildSessionSetCookie(
            parsedBody.projectId,
            result.session,
            isSecureRequest(request),
          );
        }

        return Response.json(
          {
            ok: true,
            confirmationRequired: result.confirmationRequired,
            user: result.session?.user ?? null,
            redirectTo,
          },
          { status: 200, headers },
        );
      },
    },
  },
});
