import assert from "node:assert/strict";
import { test } from "node:test";
import { elementService } from "../apps/editor/src/features/elements/services/element.service";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";

interface RecordedFetch {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | undefined;
}

function withStubbedFetch(
  handler: (req: RecordedFetch) => Promise<Response>,
  run: (calls: RecordedFetch[]) => Promise<void>,
): Promise<void> {
  const originalFetch = globalThis.fetch;
  const calls: RecordedFetch[] = [];

  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const headers: Record<string, string> = {};
    if (init?.headers && !(init.headers instanceof Headers) && !Array.isArray(init.headers)) {
      for (const [k, v] of Object.entries(init.headers)) {
        if (typeof v === "string") headers[k] = v;
      }
    }
    const rec: RecordedFetch = {
      url,
      method: init?.method ?? "GET",
      headers,
      body: typeof init?.body === "string" ? init.body : undefined,
    };
    calls.push(rec);
    return handler(rec);
  };

  return run(calls).finally(() => {
    globalThis.fetch = originalFetch;
  });
}

test("elementService batches listElementsByPages in chunks of 100 and forwards explicit bearer token", async () => {
  await withStubbedFetch(
    async (req) => {
      const parsed = new URL(req.url);
      const ids = (parsed.searchParams.get("pageIds") ?? "").split(",").filter(Boolean);
      const body: EditorElement[] = ids.map((pageId) => ({
        id: `el_${pageId}`,
        pageId,
        type: "Text",
        content: pageId,
      }));
      return Response.json(body);
    },
    async (calls) => {
      assert.deepEqual(await elementService.listElementsByPages("proj-1", [], "tok-1"), []);
      assert.equal(calls.length, 0);

      const pageIds = Array.from({ length: 205 }, (_, i) => `p${i}`);
      const elements = await elementService.listElementsByPages("proj-1", pageIds, "tok-1");
      assert.equal(calls.length, 3);
      assert.equal(calls[0].headers.Authorization, "Bearer tok-1");
      assert.equal(new URL(calls[0].url).searchParams.get("pageIds")?.split(",").length, 100);
      assert.equal(new URL(calls[1].url).searchParams.get("pageIds")?.split(",").length, 100);
      assert.equal(new URL(calls[2].url).searchParams.get("pageIds")?.split(",").length, 5);
      assert.equal(elements.length, 205);
      assert.equal(elements[204].id, "el_p204");
    },
  );
});

test("elementService builds public, snapshot, and generateCode requests and wraps saveSnapshot failures", async () => {
  await withStubbedFetch(
    async (req) => {
      if (req.url.endsWith("/api/gettoken")) {
        return Response.json({ tokenJWT: "session-jwt" });
      }
      if (req.url.endsWith("/api/v1/snapshots/proj-1/snap-1")) {
        return Response.json({
          id: "snap-1",
          name: "v1",
          type: "working",
          timestamp: 1,
          createdAt: "2026-11-23T00:00:00Z",
          elements: [{ id: "e1", pageId: "p1", type: "Text", content: "Restored" }],
        });
      }
      if (req.url.endsWith("/api/v1/snapshots/proj-fail/save")) {
        return new Response("boom", { status: 500 });
      }
      if (req.url.endsWith("/api/generate-code")) {
        return Response.json({ code: "export default function Page() {}" });
      }
      return Response.json([]);
    },
    async (calls) => {
      await elementService.listProjectElements("proj-1", "explicit");
      assert.equal(calls[0].url, "http://localhost:8080/api/v1/elements/proj-1");

      await elementService.listPublicElements("proj-1", { previewCache: true });
      assert.equal(
        calls[1].url,
        "http://localhost:8080/api/v1/elements/public/proj-1?previewCache=1",
      );
      assert.equal(calls[1].headers.Authorization, undefined);

      const loaded = await elementService.getSnapshotElements("proj-1", "snap-1");
      assert.equal(loaded[0].content, "Restored");

      const codeResult = await elementService.generateCode([], {}, { variables: {}, flows: {} });
      assert.equal(codeResult.code, "export default function Page() {}");
      const genBody = JSON.parse(calls.at(-1)!.body!);
      assert.deepEqual(genBody, { elements: [], logic: { variables: {}, flows: {} } });

      await assert.rejects(
        elementService.saveSnapshot("proj-fail", {
          id: "s1",
          name: "v1",
          type: "working",
          timestamp: 1,
          createdAt: "2026-11-23T00:00:00Z",
          elements: [],
        }),
        /saveSnapshot failed:/,
      );
    },
  );
});
