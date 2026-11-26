import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { sanitizeRedirectPath } from "@/lib/site-auth";
import {
  buildMagicLinkCallbackUrl,
  checkAuthRateLimit,
  loadProjectAuthConfigForSite,
  supabaseSendMagicLink,
  verifySameOriginRequest,
} from "@/features/preview/lib/supabase-site-auth.server";

const MagicLinkBodySchema = z.object({
  projectId: z.string().min(1).max(255),
  email: z.string().trim().email("Please enter a valid email address").max(320),
  next: z.string().max(512).optional(),
});

export const Route = createFileRoute("/api/site-auth/magic-link")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!verifySameOriginRequest(request)) {
          return Response.json({ error: "Cross-site requests are not allowed" }, { status: 403 });
        }

        let parsedBody: z.infer<typeof MagicLinkBodySchema>;
        try {
          const raw: unknown = await request.json();
          const checked = MagicLinkBodySchema.safeParse(raw);
          if (!checked.success) {
            return Response.json(
              { error: checked.error.issues[0]?.message ?? "Invalid email address" },
              { status: 400 },
            );
          }
          parsedBody = checked.data;
        } catch {
          return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        if (!checkAuthRateLimit(request, parsedBody.projectId, "magic-link")) {
          return Response.json(
            { error: "Too many requests. Please wait before requesting another link." },
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
        const result = await supabaseSendMagicLink(
          cfg,
          parsedBody.email,
          callbackUrl,
        );
        if (!result.ok) {
          return Response.json({ error: result.message }, { status: result.status });
        }

        return Response.json(
          { ok: true },
          { status: 200, headers: { "Cache-Control": "private, no-store" } },
        );
      },
    },
  },
});
