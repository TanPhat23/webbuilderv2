import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { auth } from "@clerk/tanstack-react-start/server";
import { getUserProjectAccess, requirePermission, Permission } from "@/features/auth";
import EditorProvider from "@/providers/editorprovider";

const checkEditorAccess = createServerFn({ method: "GET" })
  .inputValidator((projectId: unknown) => projectId as string)
  .handler(async ({ data: projectId }) => {
    const { userId } = await auth();

    if (!userId) throw redirect({ to: "/sign-in" });

    const access = await getUserProjectAccess(userId, projectId);
    if (!access) throw redirect({ to: "/dashboard" });

    await requirePermission(userId, projectId, Permission.PROJECT_VIEW);

    return { userId };
  });

export const Route = createFileRoute("/_protected/editor/$id")({
  beforeLoad: async ({ params }) => {
    return await checkEditorAccess({ data: params.id });
  },
  component: EditorLayout,
});

function EditorLayout() {
  const { userId } = Route.useRouteContext();
  const { id } = Route.useParams();

  return (
    <EditorProvider projectId={id} userId={userId}>
      <Outlet />
    </EditorProvider>
  );
}