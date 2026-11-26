import React, { useCallback, useMemo } from "react";
import { collectReveals, revealCss, REVEAL_NOSCRIPT_CSS } from "./reveal";
import { useScrollReveal } from "./useScrollReveal";
import { sanitizeProjectCss } from "../projects/project-css";
import PreviewElementLoader from "./PreviewElementLoader";
import { InteractionHost } from "../interactions/components/InteractionHost";
import { mergedLogic, snapshotFromServer } from "../interactions/logicSnapshot";
import {
  SiteNavigationProvider,
  type SiteNavigationContextValue,
} from "../elements/context/SiteNavigationContext";
import {
  normalizeRoutePath,
  pageRoutePath,
  resolveSiteHref,
  type SiteRoutingMode,
} from "../lib/site-routing";
import type { LoadedSitePageData } from "./preview-data";
import { usePublicCMSQuery } from "./useCMSFetch";
import { browserPlatform } from "../interactions/runtime/executors";
import type { PlatformFactory } from "../interactions/runtime/hostDom";

function encodeSlugSegments(slug: string): string {
  return slug
    .split("/")
    .filter((segment) => segment.length > 0)
    .map(encodeURIComponent)
    .join("/");
}

const parseCmsRecord = (body: unknown): Record<string, unknown> | undefined =>
  body !== null && typeof body === "object" && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : undefined;

export interface SiteRouteNavigationTarget {
  readonly slug: string;
  readonly hash?: string;
  readonly replace?: boolean;
}

export interface SitePageViewProps {
  readonly data: LoadedSitePageData;
  readonly mode: SiteRoutingMode;
  readonly showRunLog?: boolean;
  readonly onNavigate?: (target: SiteRouteNavigationTarget) => void;
}

export function SitePageView({
  data,
  mode,
  showRunLog = false,
  onNavigate,
}: SitePageViewProps): React.JSX.Element {
  const {
    project,
    page,
    pages,
    elements,
    generatedCss = "",
    params,
    itemSlug,
    matchedPath,
    cmsItem,
    user,
  } = data;
  const projectId = project.id ?? "";

  const previewQuery =
    mode.kind === "preview" && projectId
      ? `?projectId=${encodeURIComponent(projectId)}`
      : "";
  const cmsItemUrl =
    !cmsItem && page.type === "dp" && page.contentTypeId && itemSlug
      ? `/api/cms/${encodeURIComponent(page.contentTypeId)}/item/${encodeSlugSegments(itemSlug)}${previewQuery}`
      : null;
  const {
    data: fetchedCmsItem,
    loading: boundCmsLoading,
    error: boundCmsError,
  } = usePublicCMSQuery(cmsItemUrl, parseCmsRecord, undefined);
  const boundCmsItem = cmsItem ?? fetchedCmsItem;

  const pageRootData = useMemo<Record<string, unknown> | undefined>(() => {
    const hasParams = params && Object.keys(params).length > 0;
    if (!hasParams && !boundCmsItem && !user) return undefined;
    return {
      ...(params ?? {}),
      ...(boundCmsItem ?? {}),
      ...(user ? { user } : {}),
    };
  }, [params, boundCmsItem, user]);

  const logic = useMemo(
    () => mergedLogic(snapshotFromServer(project.logic, [page])),
    [project.logic, page],
  );

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

      if (!onNavigate) {
        if (typeof window !== "undefined") {
          if (opts?.replace) {
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
        onNavigate({
          slug: normalizeRoutePath(pathnamePart),
          hash,
          replace: opts?.replace,
        });
        return;
      }

      const previewPrefix = `/preview/${encodeURIComponent(mode.projectId)}`;
      const relative = pathnamePart.startsWith(previewPrefix)
        ? pathnamePart.slice(previewPrefix.length)
        : pathnamePart;
      onNavigate({
        slug: normalizeRoutePath(relative),
        hash,
        replace: opts?.replace,
      });
    },
    [mode, pages, onNavigate],
  );

  const navValue = useMemo<SiteNavigationContextValue>(
    () => ({
      mode,
      projectId,
      pages,
      currentPath,
      params,
      itemSlug,
      contentTypeId: page.contentTypeId ?? undefined,
      user: user ?? null,
      authEnabled: Boolean(project.authConfig),
      navigate: handleSiteNavigate,
    }),
    [
      mode,
      projectId,
      pages,
      currentPath,
      params,
      itemSlug,
      page.contentTypeId,
      user,
      project.authConfig,
      handleSiteNavigate,
    ],
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
