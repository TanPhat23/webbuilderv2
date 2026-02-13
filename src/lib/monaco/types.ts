import type { Monaco } from "@monaco-editor/react";
import { MONACO_EXTERNAL_LIBS } from "./constants";

/**
 * Fetches type definitions from a URL.
 */
async function fetchLibContent(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch types from ${url}: ${res.status}`);
    }
    return await res.text();
  } catch (err: unknown) {
    console.warn("Monaco Type Loader:", err);
    return null;
  }
}

/**
 * Loads external type definitions into the Monaco editor for better IntelliSense.
 */
export async function loadMonacoTypes(monaco: Monaco): Promise<void> {
  try {
    const results = await Promise.all(
      MONACO_EXTERNAL_LIBS.map(async (lib) => {
        const content = await fetchLibContent(lib.url);
        return { content, path: lib.path };
      })
    );

    for (const { content, path } of results) {
      if (content) {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          content,
          path
        );
      }
    }
  } catch (err) {
    console.error("Error loading Monaco types:", err);
  }
}
