import { getQueryClient } from "@/client/queryclient";
import { projectService } from "@/services/project";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Editor from "./editor";

export default async function EditorPage(props: PageProps<"/editor/[id]">) {
  const { id } = await props.params;
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["fonts"],
    queryFn: () => projectService.getFonts(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Editor id={id} />
    </HydrationBoundary>
  );
}
