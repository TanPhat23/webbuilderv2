import assert from "node:assert/strict";
import { test } from "node:test";
import type { RemotePresence, User } from "../apps/editor/src/features/collaboration/interfaces/websocket";
import {
  buildMouseStorePresencePatch,
  canStartCollabRoom,
  extractProviderErrorMessage,
  HIDDEN_CURSOR,
} from "../apps/editor/src/features/collaboration/lib/presenceSync";

test("buildMouseStorePresencePatch transforms presences and preserves existing user info", () => {
  const presences = new Map<string, RemotePresence>([
    [
      "u2",
      {
        userId: "u2",
        userName: "Bob",
        cursorX: 120,
        cursorY: 240,
        elementId: "btn-1",
        lastUpdated: 1000,
      },
    ],
    [
      "u3",
      {
        userId: "u3",
        userName: "Carol",
        cursorX: HIDDEN_CURSOR.x,
        cursorY: HIDDEN_CURSOR.y,
        elementId: null,
        lastUpdated: 1001,
      },
    ],
  ]);

  const existingUsers: Record<string, User> = {
    u1: { userId: "u1", userName: "Alice", email: "alice@example.com" },
    u2: { userId: "u2", userName: "Old Bob", email: "bob@example.com" },
  };

  const patch = buildMouseStorePresencePatch(presences, existingUsers);

  assert.deepEqual(patch.remoteUsers, {
    u2: { x: 120, y: 240 },
    u3: { x: -1, y: -1 },
  });
  assert.deepEqual(patch.selectedByUser, {
    u2: "btn-1",
  });
  assert.deepEqual(patch.users, {
    u1: { userId: "u1", userName: "Alice", email: "alice@example.com" },
    u2: { userId: "u2", userName: "Bob", email: "bob@example.com" },
    u3: { userId: "u3", userName: "Carol", email: "" },
  });
});

test("extractProviderErrorMessage handles Error, plain error objects, and unknown values", () => {
  assert.equal(extractProviderErrorMessage(new Error("Socket timeout")), "Socket timeout");
  assert.equal(extractProviderErrorMessage({ error: "Access denied" }), "Access denied");
  assert.equal(extractProviderErrorMessage({ message: "Rate limited" }), "Rate limited");
  assert.equal(extractProviderErrorMessage(null), "Unknown provider error");
  assert.equal(extractProviderErrorMessage({}), "Unknown provider error");
});

test("canStartCollabRoom validates all preconditions cleanly", () => {
  assert.equal(
    canStartCollabRoom({ enabled: true, isLoaded: true, userId: "u1", pageId: "p1" }),
    true,
  );
  assert.equal(
    canStartCollabRoom({ enabled: false, isLoaded: true, userId: "u1", pageId: "p1" }),
    false,
  );
  assert.equal(
    canStartCollabRoom({ enabled: true, isLoaded: false, userId: "u1", pageId: "p1" }),
    false,
  );
  assert.equal(
    canStartCollabRoom({ enabled: true, isLoaded: true, userId: null, pageId: "p1" }),
    false,
  );
  assert.equal(
    canStartCollabRoom({ enabled: true, isLoaded: true, userId: "u1", pageId: "" }),
    false,
  );
  assert.equal(
    canStartCollabRoom({ enabled: true, isLoaded: true, userId: "u1", pageId: "undefined" }),
    false,
  );
});
