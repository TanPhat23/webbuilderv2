import assert from "node:assert/strict";
import { test } from "node:test";
import type { Page } from "../apps/editor/src/features/pages";
import {
  isComponentPageId,
  resolveEditorAccess,
  resolveFallbackRoute,
  shouldRedirectDeletedProject,
  useEditor,
} from "../apps/editor/src/features/editor/hooks/useEditor";

function makePage(overrides: Partial<Page> & Pick<Page, "Id" | "Type">): Page {
  return {
    Name: "",
    Styles: null,
    ProjectId: "proj-1",
    CreatedAt: new Date(0),
    UpdatedAt: new Date(0),
    DeletedAt: null,
    ...overrides,
  };
}

test("useEditor exports the React hook and derives component page membership", () => {
  assert.equal(typeof useEditor, "function");
  const pages = [
    makePage({ Id: "home", Type: "sp" }),
    makePage({ Id: "card-master", Type: "cp" }),
  ];

  assert.equal(isComponentPageId(undefined, "card-master"), false);
  assert.equal(isComponentPageId(pages, "home"), false);
  assert.equal(isComponentPageId(pages, "card-master"), true);
  assert.equal(isComponentPageId(pages, "missing"), false);
});

test("resolveEditorAccess combines permission defaults with read-only and lock overrides", () => {
  const fullPerms = {
    canCreateElements: true,
    canEditElements: true,
    canDeleteElements: true,
    canReorderElements: false,
  };

  assert.deepEqual(resolveEditorAccess(undefined, fullPerms), {
    isReadOnly: false,
    isLocked: false,
    canCreate: true,
    permissionsSummary: fullPerms,
  });

  assert.deepEqual(resolveEditorAccess({ isReadOnly: true }, fullPerms), {
    isReadOnly: true,
    isLocked: false,
    canCreate: false,
    permissionsSummary: fullPerms,
  });

  assert.deepEqual(resolveEditorAccess({ isLocked: true }, fullPerms), {
    isReadOnly: false,
    isLocked: true,
    canCreate: false,
    permissionsSummary: fullPerms,
  });

  const viewerPerms = {
    canCreateElements: true,
    canEditElements: false,
    canDeleteElements: false,
    canReorderElements: false,
  };
  assert.equal(resolveEditorAccess(undefined, viewerPerms).isReadOnly, true);
  assert.equal(resolveEditorAccess({ isReadOnly: false }, viewerPerms).canCreate, true);
});

test("resolveFallbackRoute and shouldRedirectDeletedProject compute navigation targets", () => {
  const pages = [
    makePage({ Id: "about", Name: "About", Type: "sp" }),
    makePage({ Id: "home", Name: "", Type: "sp" }),
  ];

  assert.equal(resolveFallbackRoute("proj-1", undefined, "home"), null);
  assert.equal(resolveFallbackRoute("proj-1", pages, "home"), null);
  assert.equal(
    resolveFallbackRoute("proj-1", pages, "missing"),
    "/editor/proj-1?page=home",
  );

  assert.equal(shouldRedirectDeletedProject(undefined), false);
  assert.equal(shouldRedirectDeletedProject({ deletedAt: null }), false);
  assert.equal(shouldRedirectDeletedProject({ deletedAt: "2026-11-23T00:00:00Z" }), true);
});
