import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CollaboratorRole } from "../apps/editor/src/types/collaboration";
import {
  collaboratorKeys,
  resolveCollaboratorScopeKey,
  useLeaveProject,
  useProjectCollaborators,
  useRemoveCollaborator,
  useUpdateCollaboratorRole,
} from "../apps/editor/src/features/collaboration/hooks/useCollaborators";
import {
  getProjectInvitations,
  invitationKeys,
  resolveInvitationScopeKey,
  useAcceptInvitation,
  useCancelInvitation,
  useCreateInvitation,
  useDeleteInvitation,
  useProjectInvitations,
  useUpdateInvitationStatus,
} from "../apps/editor/src/features/collaboration/hooks/useInvitations";

interface HookHandles {
  createInvitation: ReturnType<typeof useCreateInvitation>;
  acceptInvitation: ReturnType<typeof useAcceptInvitation>;
  updateInvitationStatus: ReturnType<typeof useUpdateInvitationStatus>;
  cancelInvitation: ReturnType<typeof useCancelInvitation>;
  deleteInvitation: ReturnType<typeof useDeleteInvitation>;
  updateCollaboratorRole: ReturnType<typeof useUpdateCollaboratorRole>;
  removeCollaborator: ReturnType<typeof useRemoveCollaborator>;
  leaveProject: ReturnType<typeof useLeaveProject>;
}

function withStubbedFetch(
  responder: (url: string, method: string) => Promise<Response>,
  run: (requests: { url: string; method: string }[]) => Promise<void>,
): Promise<void> {
  const originalFetch = globalThis.fetch;
  const requests: { url: string; method: string }[] = [];
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? "GET";
    requests.push({ url, method });
    if (url.endsWith("/api/gettoken")) {
      return Response.json({ tokenJWT: "jwt-test" });
    }
    return responder(url, method);
  };
  return run(requests).finally(() => {
    globalThis.fetch = originalFetch;
  });
}

test("invitation and collaborator query keys scope consistently by project or all", () => {
  assert.deepEqual(invitationKeys.all, ["invitations"]);
  assert.deepEqual(invitationKeys.byProject("p1"), ["invitations", "project", "p1"]);
  assert.deepEqual(resolveInvitationScopeKey("p1"), ["invitations", "project", "p1"]);
  assert.deepEqual(resolveInvitationScopeKey(undefined), ["invitations"]);

  assert.deepEqual(collaboratorKeys.all, ["collaborators"]);
  assert.deepEqual(collaboratorKeys.byProject("p1"), ["collaborators", "project", "p1"]);
  assert.deepEqual(resolveCollaboratorScopeKey("p1"), ["collaborators", "project", "p1"]);
  assert.deepEqual(resolveCollaboratorScopeKey(undefined), ["collaborators"]);
});

test("getProjectInvitations validates projectId and defaults 204 responses to an empty list", async () => {
  await assert.rejects(getProjectInvitations(null), /Project ID is required/);

  await withStubbedFetch(
    async () => new Response(null, { status: 204 }),
    async (requests) => {
      const invitations = await getProjectInvitations("proj-9");
      assert.deepEqual(invitations, []);
      assert.deepEqual(
        requests.map((r) => r.url),
        [
          "http://localhost:3000/api/gettoken",
          "http://localhost:8080/api/v1/invitations/project/proj-9/pending",
        ],
      );
    },
  );
});

test("invitation and collaborator hooks execute queries, mutations, invalidations, and error handlers", async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  try {
  const invalidated: unknown[] = [];
  const originalInvalidate = queryClient.invalidateQueries.bind(queryClient);
  queryClient.invalidateQueries = (async (filters) => {
    invalidated.push(filters?.queryKey);
    return originalInvalidate(filters);
  }) as typeof queryClient.invalidateQueries;

  let handles: HookHandles | undefined;

  function Harness({ projectId }: { projectId: string | null }) {
    useProjectInvitations(projectId, false);
    useProjectCollaborators(projectId, false);
    handles = {
      createInvitation: useCreateInvitation(),
      acceptInvitation: useAcceptInvitation(),
      updateInvitationStatus: useUpdateInvitationStatus(projectId ?? undefined),
      cancelInvitation: useCancelInvitation(projectId ?? undefined),
      deleteInvitation: useDeleteInvitation(projectId ?? undefined),
      updateCollaboratorRole: useUpdateCollaboratorRole(projectId ?? undefined),
      removeCollaborator: useRemoveCollaborator(projectId ?? undefined),
      leaveProject: useLeaveProject(),
    };
    return null;
  }

  renderToStaticMarkup(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(Harness, { projectId: "proj-1" }),
    ),
  );
  assert.ok(handles);

  await withStubbedFetch(
    async (url) => {
      if (url.endsWith("/status")) {
        return Response.json({ id: "inv-1", status: "accepted" });
      }
      if (url.includes("/collaborators/")) {
        return Response.json([]);
      }
      return Response.json([]);
    },
    async () => {
      const queries = queryClient.getQueryCache().getAll();
      await Promise.all(queries.map((q) => q.fetch()));

      await handles!.createInvitation.mutateAsync({
        projectId: "proj-1",
        email: "dev@example.com",
        role: CollaboratorRole.EDITOR,
      });
      await handles!.acceptInvitation.mutateAsync({ token: "tok-1" });
      await handles!.updateInvitationStatus.mutateAsync({
        invitationId: "inv-1",
        status: "accepted",
      });
      await handles!.cancelInvitation.mutateAsync("inv-1");
      await handles!.deleteInvitation.mutateAsync("inv-1");
      await handles!.updateCollaboratorRole.mutateAsync({
        collaboratorId: "col-1",
        role: { role: CollaboratorRole.VIEWER },
      });
      await handles!.removeCollaborator.mutateAsync("col-1");
      await handles!.leaveProject.mutateAsync("proj-1");
    },
  );

  assert.deepEqual(invalidated, [
    ["invitations", "project", "proj-1"],
    ["invitations"],
    ["collaborators"],
    ["projects"],
    ["invitations", "project", "proj-1"],
    ["invitations", "project", "proj-1"],
    ["invitations", "project", "proj-1"],
    ["collaborators", "project", "proj-1"],
    ["collaborators", "project", "proj-1"],
    ["collaborators", "project", "proj-1"],
    ["projects"],
  ]);

  renderToStaticMarkup(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(Harness, { projectId: null }),
    ),
  );
  const nullProjectQueries = queryClient
    .getQueryCache()
    .findAll({ queryKey: ["collaborators", "project", ""] });
  await assert.rejects(() => nullProjectQueries[0].fetch(), /Project ID is required/);

  await withStubbedFetch(
    async () => new Response("server failure", { status: 500 }),
    async () => {
      await assert.rejects(() => handles!.cancelInvitation.mutateAsync("inv-fail"));
    },
  );
  } finally {
    queryClient.clear();
  }
});
