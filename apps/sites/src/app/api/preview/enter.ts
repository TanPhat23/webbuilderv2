import { createFileRoute } from "@tanstack/react-router";
import { sanitizeRedirectPath } from "@webbuilder/site-runtime/auth";
import {
  buildPreviewSessionCookie,
  isSecureRequest,
} from "@webbuilder/site-runtime/supabase-auth";
import { isApiError } from "@webbuilder/site-runtime/api-error";
import { exchangePreviewTicket } from "@/server/go-api";

const SAFE_PROJECT_ID = /^[A-Za-z0-9_-]{1,128}$/;

export const Route = createFileRoute("/api/preview/enter")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const ticket = url.searchParams.get("ticket")?.trim() ?? "";
        const projectId = url.searchParams.get("projectId")?.trim() ?? "";
        const rawNext = url.searchParams.get("next");
        const safeNext = sanitizeRedirectPath(rawNext, "/");

        if (!ticket || ticket.length > 256 || !SAFE_PROJECT_ID.test(projectId)) {
          return new Response("Invalid preview launch parameters", {
            status: 400,
            headers: {
              "Cache-Control": "private, no-store",
              "Referrer-Policy": "no-referrer",
            },
          });
        }

        try {
          const exchanged = await exchangePreviewTicket(ticket);
          if (exchanged.projectId !== projectId) {
            return new Response("Preview ticket does not match project", {
              status: 403,
              headers: {
                "Cache-Control": "private, no-store",
                "Referrer-Policy": "no-referrer",
              },
            });
          }

          const cookie = buildPreviewSessionCookie(
            projectId,
            exchanged.token,
            exchanged.expiresIn,
            isSecureRequest(request),
          );
          const basePath = `/preview/${encodeURIComponent(projectId)}`;
          const location =
            safeNext === "/" ? basePath : `${basePath}${safeNext}`;

          return new Response(null, {
            status: 302,
            headers: {
              Location: location,
              "Set-Cookie": cookie,
              "Cache-Control": "private, no-store",
              "Referrer-Policy": "no-referrer",
            },
          });
        } catch (error: unknown) {
          const status = isApiError(error) ? error.status : 502;
          const message =
            status === 401
              ? "Preview link expired or already used. Return to the editor and click Preview again."
              : "Unable to open preview right now.";
          return new Response(message, {
            status: status >= 400 && status < 600 ? status : 502,
            headers: {
              "Cache-Control": "private, no-store",
              "Referrer-Policy": "no-referrer",
            },
          });
        }
      },
    },
  },
});
