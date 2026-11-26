const HTML_DOCUMENT_MARKERS = ["<!doctype", "<html", "<body"];
const MAX_PREVIEW_CHARS = 10_000;
const utf8Encoder = new TextEncoder();

export function validateCssImport(text: string, maxInlineSize: number): string | null {
  if (!text) return "CSS is empty";
  if (text.length > maxInlineSize) {
    return `CSS too large (${Math.round(text.length / 1024)} KB, limit ${Math.round(maxInlineSize / 1024)} KB).`;
  }
  const lowered = text.toLowerCase();
  if (lowered.includes("<script") || lowered.includes("</script")) {
    return "CSS contains forbidden <script> tags.";
  }
  if (HTML_DOCUMENT_MARKERS.some((marker) => lowered.includes(marker))) {
    return "Please paste only CSS content (no full HTML).";
  }
  return null;
}

export function isCssUploadFile(file: { type: string; name: string }): boolean {
  return file.type.includes("css") || file.name.endsWith(".css");
}

export function formatCssPreview(css: string): string {
  const truncated = css.length > MAX_PREVIEW_CHARS ? "\n...truncated..." : "";
  return `<style>${css.slice(0, MAX_PREVIEW_CHARS)}${truncated}</style>`;
}

export function cssByteLength(css: string): number {
  return utf8Encoder.encode(css).length;
}
