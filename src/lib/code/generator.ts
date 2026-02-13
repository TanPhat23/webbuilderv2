import { EditorElement } from "@/types/global.type";
import * as t from "@babel/types";
import { generate } from "@babel/generator";
import { generateStrategies } from "./generatestrategies";

const options: {
  wrapComponent?: boolean;
  componentName?: string;
  format?: boolean;
} = {
  wrapComponent: true,
  componentName: "Generated",
  format: true,
};

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

  public async generateToJSX(elements: EditorElement[]): Promise<string> {
    console.log("Generating code for elements:", elements);
    const nodes: t.JSXElement[] = elements
      .map((el) => this.elementToJSX(el))
      .filter((el): el is t.JSXElement => el !== null);

    const inner =
      nodes.length > 0 ? nodes.map((n) => generate(n).code).join("\n") : "";

    let result = inner;
    if (options.wrapComponent) {
      const indentedInner = inner
        ? inner
            .split("\n")
            .map((line) => "      " + line)
            .join("\n")
        : "";
      result = `import React from 'react';

const ${options.componentName} = () => {
  return (
    <>
${indentedInner ? indentedInner + "\n" : ""}
    </>
  );
};

export default ${options.componentName};
`;
    }

    // Optionally format with Prettier (dynamic import, same pattern used in Monaco formatter)
    if (options.format) {
      try {
        const [prettierModule, parserTsModule] = await Promise.all([
          import("prettier/standalone"),
          import("prettier/parser-typescript"),
        ]);

        const prettierCandidate = prettierModule as any;
        const prettierAPI =
          "format" in prettierCandidate
            ? prettierCandidate
            : prettierCandidate.default;

        const parserCandidate = parserTsModule as any;
        const parserTs =
          "default" in parserCandidate
            ? parserCandidate.default
            : parserCandidate;

        result = await prettierAPI.format(result, {
          parser: "typescript",
          plugins: [parserTs],
          filepath: `${options.componentName}.tsx`,
          semi: true,
          singleQuote: false,
        });
      } catch (err) {
        console.warn("Prettier: could not format generated code", err);
      }
    }

    return result;
  }
}

export const codeGenerator = CodeGenerator.getInstance();
