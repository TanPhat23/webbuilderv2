import { createFileRoute } from "@tanstack/react-router";
import { cmsService } from "@/features/cms/services/cms.service";
import { isApiError } from "@/utils/errors/api-error";

const VALID_SORT_BY = new Set(["title", "createdAt", "updatedAt"]);
const VALID_SORT_ORDER = new Set(["asc", "desc"]);

export const Route = createFileRoute("/api/cms/$contentTypeId/")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const contentTypeId = params.contentTypeId?.trim();
        if (!contentTypeId) {
          return Response.json(
            { error: "Content type ID is required" },
            { status: 400 },
          );
        }

        const url = new URL(request.url);
        const rawLimit = Number(url.searchParams.get("limit"));
        const limit =
          Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : undefined;
        const rawSortBy = url.searchParams.get("sortBy") ?? undefined;
        const sortBy =
          rawSortBy && VALID_SORT_BY.has(rawSortBy)
            ? (rawSortBy as "title" | "createdAt" | "updatedAt")
            : undefined;
        const rawSortOrder = url.searchParams.get("sortOrder") ?? undefined;
        const sortOrder =
          rawSortOrder && VALID_SORT_ORDER.has(rawSortOrder)
            ? (rawSortOrder as "asc" | "desc")
            : undefined;

        try {
          const items = await cmsService.fetchPublicContentList({
            contentTypeId,
            limit,
            sortBy,
            sortOrder,
          });
          return Response.json(items, {
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
          console.error("Error fetching public CMS content list:", error);
          return Response.json(
            { error: "Failed to fetch CMS content" },
            { status: 500 },
          );
        }
      },
    },
  },
});
