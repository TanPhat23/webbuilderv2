import { createFileRoute } from "@tanstack/react-router";
import { cmsService } from "@/features/cms/services/cms.service";
import { isApiError } from "@/utils/errors/api-error";

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
      GET: async ({ params }) => {
        const contentTypeId = params.contentTypeId?.trim();
        const slug = decodeSlugSplat(params._splat);
        if (!contentTypeId || !slug) {
          return Response.json(
            { error: "Content type ID and slug are required" },
            { status: 400 },
          );
        }

        try {
          const item = await cmsService.fetchPublicContentItem(
            contentTypeId,
            slug,
          );
          return Response.json(item, {
            headers: {
              "Cache-Control": "public, max-age=15, stale-while-revalidate=60",
            },
          });
        } catch (error) {
          if (isApiError(error)) {
            return Response.json(
              { error: error.message },
              { status: error.status },
            );
          }
          console.error("Error fetching public CMS content item:", error);
          return Response.json(
            { error: "Failed to fetch CMS item" },
            { status: 500 },
          );
        }
      },
    },
  },
});
