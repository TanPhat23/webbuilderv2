import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { getQueryClient } from "@/client/queryclient";
import { extractSubdomain } from "@/lib/site-routing";

function rewriteSubdomainInput(url: URL): URL {
  const subdomain = extractSubdomain(url.host);
  if (!subdomain) return url;

  const { pathname } = url;
  if (
    pathname.startsWith("/sites/") ||
    pathname.startsWith("/_server") ||
    pathname.startsWith("/api/")
  ) {
    return url;
  }

  const next = new URL(url);
  next.pathname =
    pathname === "/" ? `/sites/${subdomain}` : `/sites/${subdomain}${pathname}`;
  return next;
}

function rewriteSubdomainOutput(url: URL): URL {
  const subdomain = extractSubdomain(url.host);
  if (!subdomain) return url;

  const prefix = `/sites/${subdomain}`;
  if (!url.pathname.startsWith(prefix)) return url;

  const remainder = url.pathname.slice(prefix.length);
  const next = new URL(url);
  next.pathname = remainder.length > 0 ? remainder : "/";
  return next;
}

export function getRouter() {
  const router = createRouter({
    routeTree,
    context: { queryClient: getQueryClient() },
    scrollRestoration: true,
    rewrite: {
      input: ({ url }) => rewriteSubdomainInput(url),
      output: ({ url }) => rewriteSubdomainOutput(url),
    },
  });

  return router;
}