import { createFileRoute } from "@tanstack/react-router";
import { getSubdomainSiteData } from "@/features/preview/api/preview.api";
import { SitePageView } from "@/features/preview/components/SitePageView";
import { errorMessage } from "@/utils/errors/api-error";

export const Route = createFileRoute("/sites/$subdomain/$")({
  loader: ({ params }) =>
    getSubdomainSiteData({
      data: { subdomain: params.subdomain, pathname: params._splat },
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
      <h1 className="text-2xl font-semibold mb-2">Page Not Found</h1>
      <p className="text-sm text-muted-foreground">
        This page could not be found on this site.
      </p>
    </div>
  ),
  component: SubdomainSubPage,
});

function SubdomainSubPage() {
  const { subdomain } = Route.useParams();
  const data = Route.useLoaderData();
  return (
    <SitePageView
      data={data}
      mode={{ kind: "domain", subdomain }}
    />
  );
}
