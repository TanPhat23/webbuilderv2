import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AI_COMMANDS,
  ELEMENT_STARTER_ACTIONS,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS,
  PAGE_STARTER_ACTIONS,
  buildElementContextSummary,
  buildGenerateContentRequest,
  countCanvasNodes,
  extractAiErrorMessage,
  filterAiCommands,
  formatFileSize,
  shouldShowSlashPalette,
  validateAttachmentFile,
} from "../apps/editor/src/features/ai/utils/aiChatUtils";

describe("aiChatUtils", () => {
  it("shows and filters slash commands only before the first space", () => {
    assert.equal(shouldShowSlashPalette("/"), true);
    assert.equal(shouldShowSlashPalette("/imp"), true);
    assert.equal(shouldShowSlashPalette("/improve hero"), false);
    assert.equal(shouldShowSlashPalette("hello"), false);

    assert.equal(filterAiCommands("/").length, AI_COMMANDS.length);
    const matched = filterAiCommands("/imp");
    assert.equal(matched.length, 1);
    assert.equal(matched[0]?.prefix, "/improve");
    assert.deepEqual(filterAiCommands("/improve spacing"), []);
  });

  it("counts top-level sections and nested canvas nodes", () => {
    const counts = countCanvasNodes([
      { elements: [{}, { elements: [{}] }] },
      {},
    ]);
    assert.deepEqual(counts, { sectionCount: 2, totalNodeCount: 5 });
    assert.deepEqual(countCanvasNodes([]), { sectionCount: 0, totalNodeCount: 0 });
  });

  it("validates attachment limits and formats file sizes", () => {
    assert.equal(formatFileSize(512), "512 B");
    assert.equal(formatFileSize(2048), "2.0 KB");
    assert.equal(formatFileSize(2 * 1024 * 1024), "2.0 MB");

    assert.deepEqual(
      validateAttachmentFile({ name: "hero.png", size: 1024, type: "image/png" }, 0),
      { ok: true },
    );

    const tooMany = validateAttachmentFile(
      { name: "extra.png", size: 1024, type: "image/png" },
      MAX_ATTACHMENTS,
    );
    assert.equal(tooMany.ok, false);

    const tooLarge = validateAttachmentFile(
      { name: "huge.png", size: MAX_ATTACHMENT_BYTES + 1, type: "image/png" },
      0,
    );
    assert.equal(tooLarge.ok, false);
  });

  it("builds element context summaries and scoped request payloads cleanly", () => {
    const summary = buildElementContextSummary({
      id: "el-1",
      type: "Heading",
      name: "Hero Title",
      tailwindStyles: "text-4xl font-bold tracking-tight",
      content: "Build faster websites",
    });
    assert.match(summary, /Element ID: el-1/);
    assert.match(summary, /Type: Heading/);
    assert.match(summary, /Name: Hero Title/);
    assert.match(summary, /Classes: text-4xl font-bold/);
    assert.match(summary, /Text: Build faster websites/);

    const request = buildGenerateContentRequest({
      prompt: "  /improve tighten spacing  ",
      scope: "element",
      canvasContext: {
        viewport: "desktop",
        mode: "editor",
        sectionCount: 3,
        totalNodeCount: 18,
      },
      elementContext: { id: "el-1", type: "Section", name: "Pricing" },
      attachments: [
        {
          id: "a1",
          name: "ref.png",
          size: 4096,
          mimeType: "image/png",
          isImage: true,
        },
      ],
    });

    assert.equal(request.prompt, "/improve tighten spacing");
    assert.equal(request.includeImages, true);
    assert.match(request.context ?? "", /Scope -> element/);
    assert.match(request.context ?? "", /Canvas -> mode: editor, viewport: desktop/);
    assert.match(request.context ?? "", /Selected element -> Element ID: el-1/);
    assert.match(request.context ?? "", /Attachments -> ref\.png/);
  });

  it("provides adaptive starter actions for element and page contexts", () => {
    assert.equal(ELEMENT_STARTER_ACTIONS.length, 4);
    assert.equal(PAGE_STARTER_ACTIONS.length, 4);
    const elementPrompt = ELEMENT_STARTER_ACTIONS[0]?.buildPrompt({
      id: "n1",
      type: "Button",
      name: "Primary CTA",
    });
    assert.match(elementPrompt ?? "", /Primary CTA/);
  });

  it("extracts readable error messages from unknown errors", () => {
    assert.equal(extractAiErrorMessage(new Error("Service offline")), "Service offline");
    assert.equal(extractAiErrorMessage("Timeout"), "Timeout");
    assert.equal(extractAiErrorMessage({ message: "Rate limited" }), "Rate limited");
    assert.match(extractAiErrorMessage(null), /unavailable/i);
  });
});
