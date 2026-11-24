import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { API_ENDPOINTS } from "../src/utils/shared/constants/endpoints";
import { buildPublicCollectionEndpoint } from "../src/features/cms/services/webhook.service";

describe("CMS webhooks & public collection endpoints", () => {
  it("builds project webhook routes cleanly", () => {
    assert.equal(API_ENDPOINTS.WEBHOOKS.LIST("p1"), "/api/v1/projects/p1/webhooks");
    assert.equal(
      API_ENDPOINTS.WEBHOOKS.DELIVERIES("p1", "wh1"),
      "/api/v1/projects/p1/webhooks/wh1/deliveries",
    );
    assert.equal(
      API_ENDPOINTS.WEBHOOKS.TEST("p1", "wh1"),
      "/api/v1/projects/p1/webhooks/wh1/test",
    );
  });

  it("builds public collection endpoint URL without double slashes", () => {
    assert.equal(
      buildPublicCollectionEndpoint("http://localhost:8085/", "proj 1", "menu-items"),
      "http://localhost:8085/api/v1/public/projects/proj%201/collections/menu-items/items",
    );
  });
});
