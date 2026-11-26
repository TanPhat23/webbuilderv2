import { createFileRoute } from "@tanstack/react-router";
import { isApiError } from "@webbuilder/site-runtime/api-error";
import {
  fetchPreviewCmsList,
  fetchPublicCmsList,
  readPreviewTokenFromCookieHeader,
} from "@/server/go-api";

const VALID_SORT_BY = new Set(["title", "createdAt", "updatedAt"]);
const VALID_SORT_ORDER = new Set(["asc", "desc"]);
const SAFE_PROJECT_ID = /^[A-Za-z0-9_-]{1,128}$/;

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
          Number.isInteger(rawLimit) && rawLimit > 0
            ? Math.min(rawLimit, 100)
            : undefined;
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
        const projectId = url.searchParams.get("projectId")?.trim() ?? "";

        try {
          if (projectId && SAFE_PROJECT_ID.test(projectId)) {
            const previewToken = readPreviewTokenFromCookieHeader(
              request.headers.get("cookie"),
              projectId,
            );
            if (previewToken) {
              const draftItems = await fetchPreviewCmsList(
                projectId,
                contentTypeId,
                previewToken,
                { limit, sortBy, sortOrder },
              );
              return Response.json(draftItems, {
                headers: { "Cache-Control": "private, no-store" },
              });
            }
          }

          const items = await fetchPublicCmsList(contentTypeId, {
            limit,
            sortBy,
            sortOrder,
          });
          return Response.json(items, {
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
          console.error("Error fetching CMS content list:", error);
          return Response.json(
            { error: "Failed to fetch CMS content" },
            { status: 500 },
          );
        }
      },
    },
  },
});
