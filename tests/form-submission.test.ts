import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildPublicCollectionSubmitUrl,
  submitFormToCollection,
} from "@webbuilder/site-runtime/elements/utils/formSubmission";

describe("formSubmission", () => {
  it("builds public project-scoped collection submit URL", () => {
    const url = buildPublicCollectionSubmitUrl(
      "http://localhost:8085/",
      "proj_1",
      "catering-inquiries",
    );
    assert.equal(
      url,
      "http://localhost:8085/api/v1/public/projects/proj_1/collections/catering-inquiries/items",
    );
  });

  it("handles 201 created response", async () => {
    const mockFetch: typeof fetch = async () =>
      new Response(JSON.stringify({ id: "it_1", slug: "catering-1" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });

    const result = await submitFormToCollection({
      apiBaseUrl: "http://localhost:8085",
      projectId: "proj_1",
      collectionId: "catering-inquiries",
      payload: { name: "Maya", email: "maya@example.com" },
      fetchImpl: mockFetch,
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.id, "it_1");
      assert.equal(result.slug, "catering-1");
    }
  });

  it("parses 400 validation errors", async () => {
    const mockFetch: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          error: "validation_failed",
          fields: { email: "must be a valid email address" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );

    const result = await submitFormToCollection({
      apiBaseUrl: "http://localhost:8085",
      projectId: "proj_1",
      collectionId: "catering-inquiries",
      payload: { email: "bad" },
      fetchImpl: mockFetch,
    });

    assert.equal(result.ok, false);
    if (!result.ok && result.kind === "validation") {
      assert.equal(result.fields.email, "must be a valid email address");
    } else {
      assert.fail("expected validation error");
    }
  });

  it("handles 429 rate limit and network errors", async () => {
    const rateLimitedFetch: typeof fetch = async () =>
      new Response(JSON.stringify({ error: "rate_limited" }), { status: 429 });

    const r1 = await submitFormToCollection({
      apiBaseUrl: "http://localhost:8085",
      projectId: "proj_1",
      collectionId: "catering-inquiries",
      payload: {},
      fetchImpl: rateLimitedFetch,
    });
    assert.equal(r1.ok, false);
    if (!r1.ok) {
      assert.equal(r1.kind, "rate_limited");
    }

    const failingFetch: typeof fetch = async () => {
      throw new Error("offline");
    };
    const r2 = await submitFormToCollection({
      apiBaseUrl: "http://localhost:8085",
      projectId: "proj_1",
      collectionId: "catering-inquiries",
      payload: {},
      fetchImpl: failingFetch,
    });
    assert.equal(r2.ok, false);
    if (!r2.ok) {
      assert.equal(r2.kind, "network");
    }
  });
});
