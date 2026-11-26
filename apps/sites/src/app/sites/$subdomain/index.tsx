import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  SitePageView,
  type SiteRouteNavigationTarget,
} from "@webbuilder/site-runtime";
import { errorMessage } from "@webbuilder/site-runtime/api-error";
import { getSubdomainSite } from "@/server/site-loaders";

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
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-sm text-zinc-500">Loading site…</div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-sm text-red-600">
        Unable to load site: {errorMessage(error)}
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900">
        Site Not Found
      </h1>
      <p className="text-sm text-zinc-500">
        This domain is not published or has no matching page.
      </p>
    </div>
  ),
  component: SubdomainHomePage,
});

function SubdomainHomePage() {
  const { subdomain } = Route.useParams();
  const data = Route.useLoaderData();
  const navigate = useNavigate();

  const handleNavigate = ({ slug, hash, replace }: SiteRouteNavigationTarget): void => {
    if (!slug) {
      void navigate({
        to: "/sites/$subdomain",
        params: { subdomain },
        hash,
        replace,
      });
    } else {
      void navigate({
        to: "/sites/$subdomain/$",
        params: { subdomain, _splat: slug },
        hash,
        replace,
      });
    }
  };

  return (
    <SitePageView
      data={data}
      mode={{ kind: "domain", subdomain }}
      onNavigate={handleNavigate}
    />
  );
}
