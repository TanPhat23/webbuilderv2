import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { projectService } from "@/features/projects";
import { elementService } from "@/features/editor";
import { dehydrate, HydrationBoundary, useQuery } from "@tanstack/react-query";
import { sanitizeProjectCss } from "@/features/projects/lib/project-css";
import PreviewElementLoader from "@/features/preview/components/PreviewElementLoader";
import { InteractionHost } from "@/features/interactions/components/InteractionHost";
import { mergedLogic, snapshotFromServer } from "@/features/interactions/logic-store";

export const Route = createFileRoute("/preview/$id")({
  loader: async ({ params, context }) => {
    const queryClient = context.queryClient;

    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ["project", params.id],
        queryFn: () => projectService.getProjectPublic(params.id),
      }),
      queryClient.prefetchQuery({
        queryKey: ["pages-public", params.id],
        queryFn: () => projectService.getPagesPublic(params.id),
      }),
      queryClient.prefetchQuery({
        queryKey: ["elements", params.id],
        queryFn: () => elementService.getElementsPublic(params.id),
      }),
    ]);

    return { dehydratedState: dehydrate(queryClient) as any };
  },
  component: PreviewPage,
});

function PreviewPage() {
  const { id } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const dehydratedState = loaderData?.dehydratedState;

  return (
    <HydrationBoundary state={dehydratedState}>
      <PreviewRenderer projectId={id} />
    </HydrationBoundary>
  );
}

function PreviewRenderer({ projectId }: { projectId: string }) {
  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectService.getProjectPublic(projectId),
  });

  // Published logic comes from the server; the preview renders every page at once.
  const {
    data: pages,
    isLoading: pagesLoading,
    error: pagesError,
  } = useQuery({
    queryKey: ["pages-public", projectId],
    queryFn: () => projectService.getPagesPublic(projectId),
  });

  const logic = useMemo(
    () => mergedLogic(snapshotFromServer(project?.logic, pages ?? [])),
    [project?.logic, pages],
  );

  const {
    data: elements,
    isLoading: elementsLoading,
    error: elementsError,
  } = useQuery({
    queryKey: ["elements", projectId],
    queryFn: () => elementService.getElementsPublic(projectId),
  });

  if (projectLoading || elementsLoading || pagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen min-w-screen">
        <div className="text-lg">Loading preview...</div>
      </div>
    );
  }

  if (projectError || elementsError || pagesError) {
    return (
      <div className="flex items-center justify-center min-h-screen min-w-screen">
        <div className="text-lg text-destructive">
          Error loading preview:{" "}
          {projectError?.message || elementsError?.message || pagesError?.message}
        </div>
      </div>
    );
  }

  if (!project || !elements) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-screen bg-white">
      <style
        dangerouslySetInnerHTML={{
          __html: sanitizeProjectCss(project.header?.cssStyles),
        }}
      />
      <InteractionHost elements={elements} enabled namespace={projectId} variables={logic.variables} flows={logic.flows} showLog>
        <PreviewElementLoader elements={elements} />
      </InteractionHost>
    </div>
  );
}