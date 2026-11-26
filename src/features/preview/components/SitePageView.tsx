import { useCallback, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { collectReveals, revealCss, REVEAL_NOSCRIPT_CSS } from "@/features/preview/lib/reveal";
import { useScrollReveal } from "@/features/preview/hooks/useScrollReveal";
import { sanitizeProjectCss } from "@/features/projects/lib/project-css";
import { useProjectTailwindCss } from "@/features/projects/hooks/useProjectTailwindCss";
import PreviewElementLoader from "@/features/preview/components/PreviewElementLoader";
import { InteractionHost } from "@/features/interactions/components/InteractionHost";
import { mergedLogic, snapshotFromServer } from "@/features/interactions/logic-store";
import {
  SiteNavigationProvider,
  type SiteNavigationContextValue,
} from "@/features/elements/context/SiteNavigationContext";
import {
  normalizeRoutePath,
  pageRoutePath,
  resolveSiteHref,
  type SiteRoutingMode,
} from "@/lib/site-routing";
import type { LoadedSitePageData } from "@/features/preview/lib/preview-data";
import { usePublicCMSQuery } from "@/features/preview/hooks/useCMSFetch";
import { browserPlatform } from "@/features/interactions/runtime/executors";
import type { PlatformFactory } from "@/features/interactions/runtime/hostDom";

function encodeSlugSegments(slug: string): string {
  return slug
    .split("/")
    .filter((segment) => segment.length > 0)
    .map(encodeURIComponent)
    .join("/");
}

const parseCmsRecord = (body: unknown): Record<string, unknown> | undefined =>
  body !== null && typeof body === "object"
    ? (body as Record<string, unknown>)
    : undefined;

interface SitePageViewProps {
  readonly data: LoadedSitePageData;
  readonly mode: SiteRoutingMode;
  readonly showRunLog?: boolean;
}

export function SitePageView({
  data,
  mode,
  showRunLog = false,
}: SitePageViewProps): React.JSX.Element {
  const routerNavigate = useNavigate();
  const { project, page, pages, elements, params, itemSlug, matchedPath, cmsItem } = data;
  const projectId = project.id ?? "";

  const cmsItemUrl =
    !cmsItem && page.type === "dp" && page.contentTypeId && itemSlug
      ? `/api/cms/${encodeURIComponent(page.contentTypeId)}/item/${encodeSlugSegments(itemSlug)}`
      : null;
  const {
    data: fetchedCmsItem,
    loading: boundCmsLoading,
    error: boundCmsError,
  } = usePublicCMSQuery(cmsItemUrl, parseCmsRecord, undefined);
  const boundCmsItem = cmsItem ?? fetchedCmsItem;

  const pageRootData = useMemo<Record<string, unknown> | undefined>(() => {
    const hasParams = params && Object.keys(params).length > 0;
    if (!hasParams && !boundCmsItem) return undefined;
    return {
      ...(params ?? {}),
      ...(boundCmsItem ?? {}),
    };
  }, [params, boundCmsItem]);

  const logic = useMemo(
    () => mergedLogic(snapshotFromServer(project.logic, [page])),
    [project.logic, page],
  );

  const generatedCss = useProjectTailwindCss(elements);
  const reveals = useMemo(() => collectReveals(elements), [elements]);
  useScrollReveal(reveals, true);

  const currentPath = useMemo(() => {
    if (matchedPath) return matchedPath;
    return pageRoutePath(page);
  }, [matchedPath, page]);

  const handleSiteNavigate = useCallback(
    (
      rawHref: string,
      opts?: { readonly newTab?: boolean; readonly replace?: boolean },
    ): void => {
      const resolved = resolveSiteHref(rawHref, { mode, pages });
      if (!resolved) return;

      if (resolved.kind === "anchor") {
        if (typeof window !== "undefined") {
          if (opts?.newTab) {
            window.open(resolved.href, "_blank", "noopener");
          } else {
            window.location.hash = resolved.href;
          }
        }
        return;
      }

      if (resolved.kind === "external" || opts?.newTab) {
        if (typeof window !== "undefined") {
          if (opts?.newTab) {
            window.open(resolved.href, "_blank", "noopener");
          } else if (opts?.replace) {
            window.location.replace(resolved.href);
          } else {
            window.location.assign(resolved.href);
          }
        }
        return;
      }

      const [pathnamePart = "/", hashPart] = resolved.href.split("#");
      const hash = hashPart ? hashPart : undefined;
      if (mode.kind === "domain") {
        const cleanSlug = normalizeRoutePath(pathnamePart);
        if (!cleanSlug) {
          void routerNavigate({
            to: "/sites/$subdomain",
            params: { subdomain: mode.subdomain },
            hash,
            replace: opts?.replace,
          });
        } else {
          void routerNavigate({
            to: "/sites/$subdomain/$",
            params: { subdomain: mode.subdomain, _splat: cleanSlug },
            hash,
            replace: opts?.replace,
          });
        }
        return;
      }

      const previewPrefix = `/preview/${encodeURIComponent(mode.projectId)}`;
      const relative = pathnamePart.startsWith(previewPrefix)
        ? pathnamePart.slice(previewPrefix.length)
        : pathnamePart;
      const cleanSlug = normalizeRoutePath(relative);
      if (!cleanSlug) {
        void routerNavigate({
          to: "/preview/$id",
          params: { id: mode.projectId },
          hash,
          replace: opts?.replace,
        });
      } else {
        void routerNavigate({
          to: "/preview/$id/$",
          params: { id: mode.projectId, _splat: cleanSlug },
          hash,
          replace: opts?.replace,
        });
      }
    },
    [mode, pages, routerNavigate],
  );

  const navValue = useMemo<SiteNavigationContextValue>(
    () => ({
      mode,
      pages,
      currentPath,
      params,
      itemSlug,
      contentTypeId: page.contentTypeId ?? undefined,
      navigate: handleSiteNavigate,
    }),
    [mode, pages, currentPath, params, itemSlug, page.contentTypeId, handleSiteNavigate],
  );

  const sitePlatform: PlatformFactory = useCallback(
    (doc, host, isPageElement) => {
      const base = browserPlatform(doc, host, isPageElement);
      return {
        ...base,
        navigate: (url: string, opts: { newTab: boolean; replace: boolean }): void => {
          const resolved = resolveSiteHref(url, { mode, pages });
          if (!resolved || resolved.kind === "external" || resolved.kind === "anchor") {
            base.navigate(url, opts);
            return;
          }
          handleSiteNavigate(url, opts);
        },
      };
    },
    [mode, pages, handleSiteNavigate],
  );

  return (
    <SiteNavigationProvider value={navValue}>
      <div className="min-h-screen min-w-screen bg-white">
        <style
          dangerouslySetInnerHTML={{
            __html: `${generatedCss}\n${sanitizeProjectCss(project.header?.cssStyles)}\n${revealCss(reveals)}`,
          }}
        />
        {reveals.length > 0 && (
          <noscript>
            <style dangerouslySetInnerHTML={{ __html: REVEAL_NOSCRIPT_CSS }} />
          </noscript>
        )}
        <InteractionHost
          key={page.id}
          elements={elements}
          enabled
          namespace={projectId}
          platform={sitePlatform}
          variables={logic.variables}
          flows={logic.flows}
          showLog={showRunLog}
        >
          {cmsItemUrl && boundCmsLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500">
              Loading content…
            </div>
          ) : cmsItemUrl && boundCmsError ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 px-6 text-center">
              <p className="text-2xl font-semibold text-zinc-900">404</p>
              <p className="text-sm text-zinc-500">
                We couldn&apos;t find an item for &ldquo;{itemSlug}&rdquo;.
              </p>
            </div>
          ) : (
            <PreviewElementLoader elements={elements} data={pageRootData} />
          )}
        </InteractionHost>
      </div>
    </SiteNavigationProvider>
  );
}
