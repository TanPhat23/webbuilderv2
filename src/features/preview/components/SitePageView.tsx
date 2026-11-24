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
import { browserPlatform } from "@/features/interactions/runtime/executors";
import type { PlatformFactory } from "@/features/interactions/runtime/hostDom";

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
  const { project, page, pages, elements, itemSlug } = data;
  const projectId = project.id ?? "";

  const logic = useMemo(
    () => mergedLogic(snapshotFromServer(project.logic, [page])),
    [project.logic, page],
  );

  const generatedCss = useProjectTailwindCss(elements);
  const reveals = useMemo(() => collectReveals(elements), [elements]);
  useScrollReveal(reveals, true);

  const currentPath = useMemo(() => {
    const base = pageRoutePath(page);
    if (!itemSlug) return base;
    return base === "/" ? `/${itemSlug}` : `${base}/${itemSlug}`;
  }, [page, itemSlug]);

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
      itemSlug,
      navigate: handleSiteNavigate,
    }),
    [mode, pages, currentPath, itemSlug, handleSiteNavigate],
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
          <PreviewElementLoader elements={elements} />
        </InteractionHost>
      </div>
    </SiteNavigationProvider>
  );
}
