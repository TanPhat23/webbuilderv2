import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  SitePageView,
  type SiteRouteNavigationTarget,
} from "@webbuilder/site-runtime";
import { errorMessage } from "@webbuilder/site-runtime/api-error";
import { getSubdomainSite } from "@/server/site-loaders";

export const Route = createFileRoute("/sites/$subdomain/$")({
  loader: ({ params }) =>
    getSubdomainSite({
      data: { subdomain: params.subdomain, pathname: params._splat },
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
        Page Not Found
      </h1>
      <p className="text-sm text-zinc-500">
        This page could not be found on this site.
      </p>
    </div>
  ),
  component: SubdomainSubPage,
});

function SubdomainSubPage() {
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
