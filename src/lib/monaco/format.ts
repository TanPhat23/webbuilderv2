import type { Monaco } from "@monaco-editor/react";
import type * as monacoEditor from "monaco-editor";
import type { Plugin } from "prettier";

type PrettierOptions = {
  parser?: string;
  plugins?: Plugin[];
  filepath?: string;
  semi?: boolean;
  singleQuote?: boolean;
};

type PrettierAPI = {
  format(source: string, options: PrettierOptions): string | Promise<string>;
};

/**
 * Registers Prettier as a formatting provider for TypeScript and JavaScript in Monaco.
 */
export const registerPrettierFormatter = (monaco: Monaco) => {
  const registerFor = (language: string) => {
    monaco.languages.registerDocumentFormattingEditProvider(language, {
      async provideDocumentFormattingEdits(
        model: monacoEditor.editor.ITextModel,
      ): Promise<monacoEditor.languages.TextEdit[]> {
        try {
          // Dynamic imports to keep the initial bundle size small
          const [prettierModule, tsPluginModule] = await Promise.all([
            import("prettier/standalone"),
            import("prettier/parser-typescript"),
          ]);

          const prettierCandidate = prettierModule as
            | PrettierAPI
            | { default: PrettierAPI };

          const prettier =
            "format" in (prettierCandidate as PrettierAPI)
              ? (prettierCandidate as PrettierAPI)
              : (prettierCandidate as { default: PrettierAPI }).default;

          const tsPluginCandidate = tsPluginModule as
            | Plugin
            | { default: Plugin };

          const parserTs =
            "default" in (tsPluginCandidate as { default?: Plugin })
              ? (tsPluginCandidate as { default: Plugin }).default
              : (tsPluginCandidate as Plugin);

          const originalText = model.getValue();
          const filePath = model.uri.path || model.uri.toString();

          const formatted = await prettier.format(originalText, {
            parser: "typescript",
            plugins: [parserTs],
            filepath: filePath,
            semi: true,
            singleQuote: false,
          });

          if (formatted && formatted !== originalText) {
            return [
              {
                range: model.getFullModelRange(),
                text: formatted,
              },
            ];
          }

          return [];
        } catch (err: unknown) {
          console.warn("Prettier: could not format document", err);
          return [];
        }
      },
    });
  };

  registerFor("typescript");
  registerFor("javascript");
};
