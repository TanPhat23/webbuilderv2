import type { Monaco } from "@monaco-editor/react";
import type * as monacoEditor from "monaco-editor";

type PrettierOptions = {
  parser?: string;
  plugins?: any[];
  filepath?: string;
  semi?: boolean;
  singleQuote?: boolean;
};

type PrettierAPI = {
  format(source: string, options: PrettierOptions): string | Promise<string>;
};

/**
 * Manual formatter that applies basic prettier-compatible formatting
 * Fallback when Prettier fails or isn't available
 */
function manualFormat(code: string): string {
  // Add basic formatting without external dependencies
  let result = code;

  // Normalize line endings
  result = result.replace(/\r\n/g, "\n");

  // Split into lines for processing
  let lines = result.split("\n");
  let formatted: string[] = [];
  let indentLevel = 0;
  const indentString = "  ";

  for (let line of lines) {
    const trimmed = line.trim();

    // Skip empty lines but preserve them
    if (!trimmed) {
      formatted.push("");
      continue;
    }

    // Decrease indent for closing tags/brackets
    if (
      trimmed.startsWith("}") ||
      trimmed.startsWith("]") ||
      trimmed.startsWith(")")
    ) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add indentation
    formatted.push(indentString.repeat(indentLevel) + trimmed);

    // Increase indent for opening tags/brackets
    const openCount = (trimmed.match(/[\{\[\(]/g) || []).length;
    const closeCount = (trimmed.match(/[\}\]\)]/g) || []).length;
    indentLevel += openCount - closeCount;
    indentLevel = Math.max(0, indentLevel);
  }

  return formatted.join("\n");
}

/**
 * Registers Prettier as a formatting provider for TypeScript and JavaScript in Monaco.
 * Falls back to manual formatting if Prettier fails.
 */
export const registerPrettierFormatter = (monaco: Monaco) => {
  const registerFor = (language: string) => {
    monaco.languages.registerDocumentFormattingEditProvider(language, {
      async provideDocumentFormattingEdits(
        model: monacoEditor.editor.ITextModel,
      ): Promise<monacoEditor.languages.TextEdit[]> {
        try {
          console.log(`[Prettier] Starting format for ${language}`);

          const originalText = model.getValue();

          let formatted = originalText;
          let formatSource = "prettier";

          try {
            // Try to use Prettier from CDN via dynamic import
            const prettierModule = await import("prettier/standalone");
            const babelModule = await import("prettier/parser-babel");

            const prettier = (prettierModule as any).default || prettierModule;
            const babelParser = (babelModule as any).default || babelModule;

            console.log("[Prettier] Successfully imported Prettier and Babel");

            if (prettier && typeof prettier.format === "function") {
              formatted = await prettier.format(originalText, {
                parser: "babel",
                plugins: [babelParser],
                semi: true,
                singleQuote: false,
                trailingComma: "es5",
              });
              console.log("[Prettier] Format successful with Prettier");
            } else {
              throw new Error("Prettier.format is not a function");
            }
          } catch (prettierError: unknown) {
            console.warn(
              "[Prettier] Prettier formatting failed, falling back to manual format:",
              prettierError instanceof Error
                ? prettierError.message
                : String(prettierError),
            );

            // Fallback to manual formatting
            formatted = manualFormat(originalText);
            formatSource = "manual";
          }

          if (formatted && formatted !== originalText) {
            console.log(
              `[Prettier] Returning formatted code (source: ${formatSource})`,
            );
            return [
              {
                range: model.getFullModelRange(),
                text: formatted,
              },
            ];
          }

          console.log("[Prettier] Code unchanged after formatting");
          return [];
        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err));
          console.error(`[Prettier] Unexpected error during formatting:`, {
            message: error.message,
            stack: error.stack,
            language,
          });

          return [];
        }
      },
    });
  };

  registerFor("typescript");
  registerFor("javascript");
  registerFor("jsx");
  registerFor("tsx");
};
