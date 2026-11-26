import { createFileRoute } from "@tanstack/react-router";
import {
  buildDirectPreviewUrl,
  mintPreviewLaunchUrl,
  resolvePreviewOrigin,
} from "@/features/preview/api/preview-ticket.api";

const SAFE_PROJECT_ID = /^[A-Za-z0-9_-]{1,128}$/;

export const Route = createFileRoute("/preview/$id/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const projectId = params.id?.trim() ?? "";
        if (!SAFE_PROJECT_ID.test(projectId)) {
          return new Response("Invalid project ID", { status: 400 });
        }

        const splat = params._splat?.trim().replace(/^\/+/, "") ?? "";
        const nextPath = splat ? `/${splat}` : "/";

        try {
          const launched = await mintPreviewLaunchUrl(projectId, nextPath);
          return new Response(null, {
            status: 302,
            headers: {
              Location: launched.url,
              "Cache-Control": "private, no-store",
              "Referrer-Policy": "no-referrer",
            },
          });
        } catch {
          return new Response(null, {
            status: 302,
            headers: {
              Location: buildDirectPreviewUrl(
                resolvePreviewOrigin(),
                projectId,
                nextPath,
              ),
              "Cache-Control": "private, no-store",
              "Referrer-Policy": "no-referrer",
            },
          });
        }
      },
    },
  },
});
