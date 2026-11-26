import assert from "node:assert/strict";
import { test } from "node:test";
import {
  Base64ImageSchema,
  ImageDragDataSchema,
  ImageFileSchema,
  ImagesArraySchema,
  ImageUploadResponseSchema,
} from "../apps/editor/src/features/images/schema/imageupload";
import { ApiError } from "@webbuilder/site-runtime/api-error";
import {
  PERMISSION_ERRORS,
  showErrorToast,
  showSuccessToast,
} from "../apps/editor/src/utils/errors/errorToast";
import {
  getErrorMessage,
  createMutationErrorHandler,
  createMutationSuccessHandler,
} from "../apps/editor/src/hooks/utils/mutationUtils";

test("image upload schemas validate MIME types, byte limits, base64 URIs, and drag payloads", () => {
  const validPng = new File([new Uint8Array([1, 2, 3])], "pic.png", { type: "image/png" });
  assert.equal(ImageFileSchema.safeParse({ file: validPng }).success, true);

  const badType = new File(["plain"], "doc.txt", { type: "text/plain" });
  assert.equal(ImageFileSchema.safeParse({ file: badType }).success, false);

  const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "huge.png", { type: "image/png" });
  assert.equal(ImageFileSchema.safeParse({ file: oversized }).success, false);

  assert.equal(
    Base64ImageSchema.safeParse({ base64: "data:image/png;base64,AQID" }).success,
    true,
  );
  assert.equal(
    Base64ImageSchema.safeParse({ base64: "data:text/plain;base64,AQID" }).success,
    false,
  );
  assert.equal(
    Base64ImageSchema.safeParse({ base64: `data:image/jpeg;base64,${"A".repeat(7_000_000)}` }).success,
    false,
  );

  assert.equal(
    ImageUploadResponseSchema.safeParse({
      imageId: "img-1",
      imageLink: "https://cdn.example.com/a.png",
      createdAt: "2026-01-01T00:00:00Z",
    }).success,
    true,
  );
  assert.equal(
    ImagesArraySchema.safeParse([
      {
        imageId: "img-1",
        imageLink: "https://cdn.example.com/a.png",
        userId: "u1",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    ]).success,
    true,
  );
  assert.equal(
    ImageDragDataSchema.safeParse({
      imageId: "img-1",
      imageLink: "https://cdn.example.com/a.png",
      type: "image",
    }).success,
    true,
  );
});

test("useElementCommentStore manages visibility, active element, filter, and sort order", async () => {
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const backing = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => backing.get(k) ?? null,
      setItem: (k: string, v: string) => void backing.set(k, v),
      removeItem: (k: string) => void backing.delete(k),
      clear: () => backing.clear(),
    },
  });

  try {
    const { useElementCommentStore } = await import(
      "../apps/editor/src/features/editor/store/element-comment-store"
    );
    const s = useElementCommentStore.getState();
    assert.equal(s.isCommentsVisible, true);
    s.toggleCommentsVisibility();
    assert.equal(useElementCommentStore.getState().isCommentsVisible, false);
    s.setCommentsVisible(true);
    assert.equal(useElementCommentStore.getState().isCommentsVisible, true);

    s.toggleCommentButtons();
    assert.equal(useElementCommentStore.getState().showCommentButtons, false);
    s.setCommentButtonsVisible(true);
    assert.equal(useElementCommentStore.getState().showCommentButtons, true);

    s.setActiveCommentElement("el-1");
    assert.equal(useElementCommentStore.getState().activeCommentElementId, "el-1");
    s.clearActiveElement();
    assert.equal(useElementCommentStore.getState().activeCommentElementId, undefined);

    s.setViewMode("unresolved");
    s.setSortOrder("oldest");
    assert.equal(useElementCommentStore.getState().viewMode, "unresolved");
    assert.equal(useElementCommentStore.getState().sortOrder, "oldest");
  } finally {
    if (originalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalStorage);
    } else {
      delete (globalThis as Record<string, unknown>).localStorage;
    }
  }
});

test("errorToast and mutationUtils normalize messages and handle server request references", () => {
  assert.equal(getErrorMessage(new Error("boom"), "fallback"), "boom");
  assert.equal(getErrorMessage("raw message", "fallback"), "raw message");
  assert.equal(getErrorMessage({ message: "object msg" }, "fallback"), "object msg");
  assert.equal(getErrorMessage({ message: 123 }, "fallback"), "fallback");

  assert.ok(PERMISSION_ERRORS.cannotAdd.includes("read-only"));

  const serverErr = new ApiError("Internal failure", 500, "server", { requestId: "req_abc" });
  showErrorToast(serverErr, { duration: 100 });
  showErrorToast("plain error");
  showSuccessToast("saved");

  createMutationSuccessHandler("Created")();
  const origErr = console.error;
  const logged: unknown[] = [];
  console.error = (...args: unknown[]) => {
    logged.push(args);
  };
  try {
    createMutationErrorHandler("Fallback", { log: true })(new Error("bad input"));
    assert.equal(logged.length, 1);
  } finally {
    console.error = origErr;
  }
});
