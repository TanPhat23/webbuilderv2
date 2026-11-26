import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@clerk/tanstack-react-start/server";
import { parseProjectAuthConfig } from "@/lib/site-auth";
import {
  supabaseTestConnection,
  verifySameOriginRequest,
} from "@/features/preview/lib/supabase-site-auth.server";

export const Route = createFileRoute("/api/site-auth/test")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!verifySameOriginRequest(request)) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        const { userId } = await auth();
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const cfg = parseProjectAuthConfig({
          provider: "supabase",
          ...(raw !== null && typeof raw === "object"
            ? (raw as Record<string, unknown>)
            : {}),
        });
        if (!cfg) {
          return Response.json(
            {
              error:
                "Invalid Supabase URL or Publishable/Anon key (never use a service_role or secret key).",
            },
            { status: 400 },
          );
        }

        const result = await supabaseTestConnection(cfg);
        if (!result.ok) {
          return Response.json({ error: result.message }, { status: 400 });
        }
        return Response.json(result, {
          status: 200,
          headers: { "Cache-Control": "private, no-store" },
        });
      },
    },
  },
});
