import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  SitePageView,
  type SiteRouteNavigationTarget,
} from "@webbuilder/site-runtime";
import { errorMessage } from "@webbuilder/site-runtime/api-error";
import { getPreviewSite } from "@/server/site-loaders";

export const Route = createFileRoute("/preview/$id/")({
  validateSearch: (search: Record<string, unknown>): { page?: string } => ({
    page: typeof search.page === "string" ? search.page : undefined,
  }),
  loaderDeps: ({ search }) => ({ pageTarget: search.page }),
  loader: ({ params, deps }) =>
    getPreviewSite({ data: { id: params.id, pageTarget: deps.pageTarget } }),
  headers: () => ({ "Cache-Control": "private, no-store" }),
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-sm text-zinc-500">Loading preview…</div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-sm text-red-600">
        Error loading preview: {errorMessage(error)}
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900">
        Preview Unavailable
      </h1>
      <p className="max-w-md text-sm text-zinc-500">
        This preview session expired or the page does not exist. Re-open Preview
        from the WebBuilder editor.
      </p>
    </div>
  ),
  component: PreviewHomePage,
});

function PreviewHomePage() {
  const { id } = Route.useParams();
  const data = Route.useLoaderData();
  const navigate = useNavigate();

  const handleNavigate = ({ slug, hash, replace }: SiteRouteNavigationTarget): void => {
    if (!slug) {
      void navigate({ to: "/preview/$id", params: { id }, hash, replace });
    } else {
      void navigate({
        to: "/preview/$id/$",
        params: { id, _splat: slug },
        hash,
        replace,
      });
    }
  };

  return (
    <SitePageView
      data={data}
      mode={{ kind: "preview", projectId: id }}
      showRunLog
      onNavigate={handleNavigate}
    />
  );
}
