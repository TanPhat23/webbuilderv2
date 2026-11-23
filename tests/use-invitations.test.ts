import assert from "node:assert/strict";
import { test } from "node:test";
import {
  collaboratorKeys,
  resolveCollaboratorScopeKey,
} from "../src/features/collaboration/hooks/useCollaborators";
import {
  fetchProjectInvitations,
  invitationKeys,
  resolveInvitationScopeKey,
} from "../src/features/collaboration/hooks/useInvitations";

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

test("fetchProjectInvitations validates projectId, fetches pending invitations, and falls back to empty array", async () => {
  await assert.rejects(fetchProjectInvitations(null), /Project ID is required/);

  const originalFetch = globalThis.fetch;
  const requested: string[] = [];
  globalThis.fetch = async (input) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    requested.push(url);
    if (url.endsWith("/api/gettoken")) return Response.json({ tokenJWT: "jwt" });
    return new Response(null, { status: 204 });
  };

  try {
    const invitations = await fetchProjectInvitations("proj-9");
    assert.deepEqual(invitations, []);
    assert.deepEqual(requested, [
      "http://localhost:3000/api/gettoken",
      "http://localhost:8080/api/v1/invitations/project/proj-9/pending",
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
