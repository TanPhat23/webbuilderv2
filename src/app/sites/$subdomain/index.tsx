import { createFileRoute } from "@tanstack/react-router";
import { getSubdomainSite } from "@/features/preview/api/preview.api";
import { SitePageView } from "@/features/preview/components/SitePageView";
import { errorMessage } from "@/utils/errors/api-error";

export const Route = createFileRoute("/sites/$subdomain/")({
  validateSearch: (search: Record<string, unknown>): { page?: string } => ({
    page: typeof search.page === "string" ? search.page : undefined,
  }),
  loaderDeps: ({ search }) => ({ pathname: search.page }),
  loader: ({ params, deps }) =>
    getSubdomainSite({
      data: { subdomain: params.subdomain, pathname: deps.pathname },
    }),
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-sm text-muted-foreground">Loading site...</div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-sm text-destructive">
        Unable to load site: {errorMessage(error)}
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-2xl font-semibold mb-2">Site Not Found</h1>
      <p className="text-sm text-muted-foreground">
        This domain is not published or has no matching page.
      </p>
    </div>
  ),
  component: SubdomainHomePage,
});

function SubdomainHomePage() {
  const { subdomain } = Route.useParams();
  const data = Route.useLoaderData();
  return (
    <SitePageView
      data={data}
      mode={{ kind: "domain", subdomain }}
    />
  );
}
