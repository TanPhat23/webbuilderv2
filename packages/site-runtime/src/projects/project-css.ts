/**
 * Project CSS is user-authored and is injected into the editor canvas and the
 * published preview. It must be CSS only: no markup, no scripts.
 *
 * Legacy values may contain HTML (`<style>` blocks, Google Fonts `<link>`s), so
 * this extracts the CSS out of those and drops everything else.
 */

const STYLE_BLOCK = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi;
const LINK_TAG = /<link\b[^>]*>/gi;
const ANY_TAG = /<\/?[a-z!][^>]*>/gi;

function stylesheetLinkToImport(tag: string): string | null {
  if (!/rel\s*=\s*["']?stylesheet/i.test(tag)) return null;
  const href = /href\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
  if (!href || !/^https:\/\//i.test(href)) return null;
  return `@import url("${href.replace(/["\\]/g, "")}");`;
}

export function sanitizeProjectCss(input: string | null | undefined): string {
  let css = (input ?? "").trim();
  if (!css) return "";

  if (css.includes("<")) {
    const imports = (css.match(LINK_TAG) ?? [])
      .map(stylesheetLinkToImport)
      .filter((v): v is string => v !== null);
    const blocks = Array.from(css.matchAll(STYLE_BLOCK), (m) => m[1]);
    // No <style> wrapper: treat the remainder as CSS after removing tags.
    const body = blocks.length
      ? blocks.join("\n")
      : css.replace(LINK_TAG, "").replace(ANY_TAG, "");
    css = [...imports, body].join("\n");
  }

  return css
    .replace(/<\/?[a-z!][^>]*>/gi, "") // stray tags inside style bodies
    .replace(/<\/style/gi, "") // cannot break out of the <style> element
    .replace(/@import\b[^;]*;?/gi, (rule) =>
      /^@import\s+(?:url\(\s*)?["']?https:\/\//i.test(rule) ? rule : "",
    ) // https imports only
    .replace(/expression\s*\(/gi, "(")
    .replace(/javascript\s*:/gi, "")
    .trim();
}

/** The `<style>` element markup the canvas iframe and preview inject. */
export function projectCssToStyleTag(css: string | null | undefined): string {
  const clean = sanitizeProjectCss(css);
  return clean ? `<style>${clean}</style>` : "";
}
