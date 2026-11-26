import { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import * as t from "@babel/types";
import { generate } from "@babel/generator";
import { generateStrategies, generationOptions } from "./generatestrategies";
import { hasInteractionCode, toCode, type CodegenInput } from "@/features/interactions/codegen/interactions";
import { generateImports } from "./generateImports";
import { isEmptyPreamble, type Preamble } from "./customCode";
import { format } from "prettier/standalone";
import * as babelPlugin from "prettier/plugins/babel";
import * as estreePlugin from "prettier/plugins/estree";

const options: {
  wrapComponent?: boolean;
  componentName?: string;
} = {
  wrapComponent: true,
  componentName: "Generated",
};

/** Page and project logic that the generated interactions use. */
export interface InteractionLogic {
  variables: CodegenInput["variables"];
  flows: CodegenInput["flows"];
}

/** Formats generated source; if Prettier cannot parse it, the raw source is still usable. */
async function formatSource(source: string): Promise<string> {
  try {
    return await format(source, {
      parser: "babel-ts",
      plugins: [babelPlugin, estreePlugin],
      singleQuote: true,
      printWidth: 80,
    });
  } catch (err) {
    console.warn("Could not format generated code:", err);
    return source;
  }
}

class CodeGenerator {
  private static instance: CodeGenerator;
  constructor() {}

  static getInstance(): CodeGenerator {
    if (!CodeGenerator.instance) {
      CodeGenerator.instance = new CodeGenerator();
    }
    return CodeGenerator.instance;
  }

  private elementToJSX(element: EditorElement): t.JSXElement | null {
    const strategy = generateStrategies[element.type];
    if (!strategy) {
      console.warn(`No generate strategy for element type: ${element.type}`);
      return null;
    }
    try {
      return strategy.generate(element);
    } catch (err) {
      console.error(
        `Error generating JSX for element type ${element.type}:`,
        err,
      );
      return null;
    }
  }

  /** Variables and flows in scope for these elements; absent means none. */
  private interactionInput(elements: EditorElement[], logic?: InteractionLogic): CodegenInput {
    return {
      elements: elements as unknown as CodegenInput["elements"],
      variables: logic?.variables ?? {},
      flows: logic?.flows ?? {},
    };
  }

  /** The `interactions.ts` module for these elements, or null when there is nothing to generate. */
  public generateInteractions(elements: EditorElement[], logic?: InteractionLogic): string | null {
    const input = this.interactionInput(elements, logic);
    return hasInteractionCode(input) ? toCode(input) : null;
  }

  /**
   * `tagIds` adds `data-element-id` to every element, which lets edits to the
   * code be matched back to the elements they came from. `preamble` is code
   * the user wrote around the JSX (imports, hooks), kept as they wrote it.
   */
  public async generateToJSX(
    elements: EditorElement[],
    logic?: InteractionLogic,
    { tagIds = false, preamble }: { tagIds?: boolean; preamble?: Preamble } = {},
  ): Promise<string> {
    const withInteractions = hasInteractionCode(this.interactionInput(elements, logic));
    // Elements need `data-element-id` so the interactions module can find them.
    generationOptions.tagElementIds = withInteractions || tagIds;
    let nodes: t.JSXElement[];
    try {
      nodes = elements
        .map((el) => this.elementToJSX(el))
        .filter((el): el is t.JSXElement => el !== null);
    } finally {
      generationOptions.tagElementIds = false;
    }

    const inner =
      nodes.length > 0 ? nodes.map((n) => generate(n).code).join("\n") : "";

    let result = inner;
    if (options.wrapComponent) {
      const custom = preamble && !isEmptyPreamble(preamble) ? preamble : undefined;
      let imports =
        generateImports(inner) +
        (withInteractions ? "\nimport { bindInteractions } from './interactions';" : "");
      if (custom?.imports.trim()) {
        // A user's own `import React ...` replaces the generated one.
        if (/^\s*import\s+React\b/m.test(custom.imports)) imports = imports.replace("import React from 'react';\n", "").replace("import React from 'react';", "");
        imports += `\n${custom.imports.trim()}`;
      }
      const effect = withInteractions ? "React.useEffect(() => bindInteractions(), []);" : "";
      const bodyStatements = [effect, custom?.body.trim() ?? ""].filter(Boolean).join("\n\n");

      // Prettier lays the JSX out; babel's generator prints it on one line.
      result = await formatSource(`/**
 * Generated component
 * Note: TypeScript errors in Monaco editor are expected - the editor
 * doesn't have full project context.
 */
${imports}
${custom?.top.trim() ? `\n${custom.top.trim()}\n` : ""}
const ${options.componentName} = () => {${bodyStatements ? `\n${bodyStatements}\n` : ""}
  return (
    <>
      ${inner}
    </>
  );
};

export default ${options.componentName};
`);
    }

    return result;
  }
}

export const codeGenerator = CodeGenerator.getInstance();
