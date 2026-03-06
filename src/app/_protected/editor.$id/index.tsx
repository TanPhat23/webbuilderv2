import { createFileRoute } from "@tanstack/react-router";
import { getQueryClient } from "@/client/queryclient";
import { projectService } from "@/features/projects";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Editor from "./-editor";

export const Route = createFileRoute("/_protected/editor/$id/")({
  loader: async ({ params }) => {
    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
      queryKey: ["fonts"],
      queryFn: () => projectService.getFonts(),
    });
    return { dehydratedState: dehydrate(queryClient) as any };
  },
  component: EditorPage,
});

function EditorPage() {
  const { id } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const dehydratedState = loaderData?.dehydratedState;

  return (
    <HydrationBoundary state={dehydratedState}>
      <Editor id={id} />
    </HydrationBoundary>
  );
}