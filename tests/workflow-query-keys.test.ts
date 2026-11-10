import test from "node:test";
import assert from "node:assert/strict";
import { eventWorkflowKeys } from "../src/features/eventworkflows/constants/queryKeys";

test("eventWorkflowKeys produces correct query key hierarchy", () => {
  assert.deepEqual(eventWorkflowKeys.all, ["eventWorkflows"]);
  assert.deepEqual(eventWorkflowKeys.lists(), ["eventWorkflows", "list"]);
  assert.deepEqual(eventWorkflowKeys.list("proj-123"), ["eventWorkflows", "list", "proj-123"]);
  assert.deepEqual(eventWorkflowKeys.details(), ["eventWorkflows", "detail"]);
  assert.deepEqual(eventWorkflowKeys.detail("wf-456"), ["eventWorkflows", "detail", "wf-456"]);
});
