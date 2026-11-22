import { useMemo } from "react";
import { collectReveals, revealCss, REVEAL_NOSCRIPT_CSS } from "@/features/preview/lib/reveal";
import { useScrollReveal } from "@/features/preview/hooks/useScrollReveal";
import { createFileRoute } from "@tanstack/react-router";
import { getPreviewData } from "@/features/preview/api/preview.api";
import { sanitizeProjectCss } from "@/features/projects/lib/project-css";
import { useProjectTailwindCss } from "@/features/projects/hooks/useProjectTailwindCss";
import PreviewElementLoader from "@/features/preview/components/PreviewElementLoader";
import { InteractionHost } from "@/features/interactions/components/InteractionHost";
import { mergedLogic, snapshotFromServer } from "@/features/interactions/logic-store";
import { errorMessage } from "@/utils/errors/api-error";

export const Route = createFileRoute("/preview/$id")({
  validateSearch: (search: Record<string, unknown>): { page?: string } => ({
    page: typeof search.page === "string" ? search.page : undefined,
  }),
  loaderDeps: ({ search }) => ({ pageId: search.page }),
  loader: ({ params, deps }) => getPreviewData({ data: { id: params.id, pageId: deps.pageId } }),
  headers: () => ({ "Cache-Control": "private, no-store" }),
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading preview...</div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-destructive">Error loading preview: {errorMessage(error)}</div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Preview page not found</div>
    </div>
  ),
  component: PreviewPage,
});

function PreviewPage() {
  const { id: projectId } = Route.useParams();
  const { project, page, elements } = Route.useLoaderData();
  const logic = useMemo(
    () => mergedLogic(snapshotFromServer(project.logic, [page])),
    [project.logic, page],
  );

  // Classes stored in the project are not in the app's own stylesheet.
  const generatedCss = useProjectTailwindCss(elements);

  // Elements with a scroll reveal start hidden (CSS) and show as they scroll into view.
  const reveals = useMemo(() => collectReveals(elements), [elements]);
  useScrollReveal(reveals, true);

  return (
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
      <InteractionHost key={page.id} elements={elements} enabled namespace={projectId} variables={logic.variables} flows={logic.flows} showLog>
        <PreviewElementLoader elements={elements} />
      </InteractionHost>
    </div>
  );
}
