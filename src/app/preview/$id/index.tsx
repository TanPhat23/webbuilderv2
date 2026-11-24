import { createFileRoute } from "@tanstack/react-router";
import { getPreviewData } from "@/features/preview/api/preview.api";
import { SitePageView } from "@/features/preview/components/SitePageView";
import { errorMessage } from "@/utils/errors/api-error";

export const Route = createFileRoute("/preview/$id/")({
  validateSearch: (search: Record<string, unknown>): { page?: string } => ({
    page: typeof search.page === "string" ? search.page : undefined,
  }),
  loaderDeps: ({ search }) => ({ pageTarget: search.page }),
  loader: ({ params, deps }) =>
    getPreviewData({ data: { id: params.id, pageTarget: deps.pageTarget } }),
  headers: () => ({ "Cache-Control": "private, no-store" }),
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading preview...</div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-destructive">
        Error loading preview: {errorMessage(error)}
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Preview page not found</div>
    </div>
  ),
  component: PreviewHomePage,
});

function PreviewHomePage() {
  const { id } = Route.useParams();
  const data = Route.useLoaderData();
  return (
    <SitePageView
      data={data}
      mode={{ kind: "preview", projectId: id }}
      showRunLog
    />
  );
}
