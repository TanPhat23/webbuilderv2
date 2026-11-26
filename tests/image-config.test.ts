import assert from "node:assert/strict";
import { test } from "node:test";
import {
  extractImageFileName,
  parseImageDecoding,
  parseImageLoading,
  parseObjectFit,
} from "../apps/editor/src/features/editor/lib/imageConfig";

test("image setting parsers accept known options and reject invalid values", () => {
  assert.equal(parseObjectFit("cover"), "cover");
  assert.equal(parseObjectFit("crop"), null);
  assert.equal(parseImageLoading("eager"), "eager");
  assert.equal(parseImageLoading("never"), null);
  assert.equal(parseImageDecoding("async"), "async");
  assert.equal(parseImageDecoding("fast"), null);
});

test("extractImageFileName handles URLs and inline data URIs safely", () => {
  assert.equal(extractImageFileName("https://cdn.example.com/a/photo.png?w=400"), "photo.png");
  assert.equal(extractImageFileName("data:image/png;base64,iVBORw0KGgo="), "inline image");
});
