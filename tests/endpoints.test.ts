import assert from "node:assert/strict";
import { test } from "node:test";
import {
  API_ENDPOINTS,
  NEXT_API_ENDPOINTS,
} from "../src/utils/shared/constants/endpoints";
import { URLBuilder } from "../src/utils/urlbuilder";

test("endpoint builders produce clean API paths without undefined segments", () => {
  const urls = [
    API_ENDPOINTS.AGENT_TOKENS.LIST,
    API_ENDPOINTS.AGENT_TOKENS.REVOKE("tok_1"),
    API_ENDPOINTS.ELEMENTS.GET("p1"),
    API_ENDPOINTS.ELEMENTS.GET_PUBLIC("p1"),
    API_ENDPOINTS.ELEMENTS.GET_BY_PAGES,
    API_ENDPOINTS.PROJECTS.GET_BY_ID("p1"),
    API_ENDPOINTS.PROJECTS.GET_PAGES("p1"),
    API_ENDPOINTS.PROJECTS.UPDATE_PAGE("p1", "pg1"),
    API_ENDPOINTS.PROJECTS.DELETE_PAGE("p1", "pg1"),
    API_ENDPOINTS.PROJECTS.ACCESS("p1"),
    API_ENDPOINTS.PAGES.CREATE("p1"),
    API_ENDPOINTS.PAGES.GET_PUBLIC("p1"),
    API_ENDPOINTS.SNAPSHOTS.SAVE("p1"),
    API_ENDPOINTS.SNAPSHOTS.GET("p1"),
    API_ENDPOINTS.SNAPSHOTS.LOAD("p1", "s1"),
    API_ENDPOINTS.CMS.CONTENT_TYPES.GET_BY_ID("ct1"),
    API_ENDPOINTS.CMS.CONTENT_FIELDS.UPDATE("ct1", "f1"),
    API_ENDPOINTS.CMS.CONTENT_ITEMS.DELETE("ct1", "i1"),
    API_ENDPOINTS.CMS.PUBLIC_CONTENT.GET_ITEM("ct1", "hello"),
    API_ENDPOINTS.INVITATIONS.GET_PENDING_BY_PROJECT("p1"),
    API_ENDPOINTS.INVITATIONS.CANCEL("inv1"),
    API_ENDPOINTS.INVITATIONS.UPDATE_STATUS("inv1"),
    API_ENDPOINTS.COLLABORATORS.REMOVE_SELF("p1"),
    API_ENDPOINTS.CUSTOM_ELEMENTS.DUPLICATE("ce1"),
    API_ENDPOINTS.USERS.GET_BY_EMAIL("a@example.com"),
    API_ENDPOINTS.USERS.GET_BY_USERNAME("alice"),
    API_ENDPOINTS.ELEMENT_COMMENTS.TOGGLE_RESOLVED("c1"),
    API_ENDPOINTS.ELEMENT_COMMENTS.GET_BY_AUTHOR("u1"),
    API_ENDPOINTS.ELEMENT_COMMENTS.GET_BY_PROJECT("p1"),
    NEXT_API_ENDPOINTS.PROJECTS.UPDATE_PAGE("p1", "pg1"),
    NEXT_API_ENDPOINTS.PROJECTS.DELETE_PAGE("p1", "pg1"),
    NEXT_API_ENDPOINTS.TOKEN.GET,
  ];

  for (const path of urls) {
    assert.ok(path.startsWith("/api/"), path);
    assert.equal(path.includes("undefined"), false, path);
    assert.equal(path.includes("//"), false, path);
  }
});

test("URLBuilder resolves service bases, fallback origins, paths, and query parameters safely in Node", () => {
  const apiUrl = new URLBuilder("api")
    .setPath(API_ENDPOINTS.ELEMENTS.GET("p1"))
    .addQueryParam("filter", "a b")
    .build();
  assert.equal(apiUrl, "http://localhost:8080/api/v1/elements/p1?filter=a+b");

  assert.equal(
    new URLBuilder("next").setPath(NEXT_API_ENDPOINTS.TOKEN.GET).build(),
    "http://localhost:3000/api/gettoken",
  );
  assert.equal(
    new URLBuilder("none").setPath("/health").build(),
    "http://localhost:3000/health",
  );
  assert.equal(
    new URLBuilder("https://cdn.example.com").setPath("/assets/logo.png").build(),
    "https://cdn.example.com/assets/logo.png",
  );
  assert.equal(new URLBuilder("/custom").build(), "http://localhost:3000/custom");
});
