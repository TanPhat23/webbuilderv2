import { createFileRoute } from "@tanstack/react-router";
import { isApiError } from "@webbuilder/site-runtime/api-error";
import {
  fetchPreviewCmsItem,
  fetchPublicCmsItem,
  readPreviewTokenFromCookieHeader,
} from "@/server/go-api";

const SAFE_PROJECT_ID = /^[A-Za-z0-9_-]{1,128}$/;

function decodeSlugSplat(raw: string | undefined): string {
  if (!raw) return "";
  return raw
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join("/")
    .trim();
}

export const Route = createFileRoute("/api/cms/$contentTypeId/item/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const contentTypeId = params.contentTypeId?.trim();
        const slug = decodeSlugSplat(params._splat);
        if (!contentTypeId || !slug) {
          return Response.json(
            { error: "Content type ID and slug are required" },
            { status: 400 },
          );
        }

        const url = new URL(request.url);
        const projectId = url.searchParams.get("projectId")?.trim() ?? "";

        try {
          if (projectId && SAFE_PROJECT_ID.test(projectId)) {
            const previewToken = readPreviewTokenFromCookieHeader(
              request.headers.get("cookie"),
              projectId,
            );
            if (previewToken) {
              const draftItem = await fetchPreviewCmsItem(
                projectId,
                contentTypeId,
                slug,
                previewToken,
              );
              return Response.json(draftItem, {
                headers: { "Cache-Control": "private, no-store" },
              });
            }
          }

          const item = await fetchPublicCmsItem(contentTypeId, slug);
          return Response.json(item, {
            headers: {
              "Cache-Control": "public, max-age=15, stale-while-revalidate=60",
            },
          });
        } catch (error: unknown) {
          if (isApiError(error)) {
            return Response.json(
              { error: error.message },
              { status: error.status },
            );
          }
          console.error("Error fetching CMS content item:", error);
          return Response.json(
            { error: "Failed to fetch CMS item" },
            { status: 500 },
          );
        }
      },
    },
  },
});
