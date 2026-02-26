import { EditorElement } from "@/types/global.type";
import * as t from "@babel/types";
import { generate } from "@babel/generator";
import { generateStrategies } from "./generatestrategies";
import { generateImports } from "./generateImports";

const options: {
  wrapComponent?: boolean;
  componentName?: string;
} = {
  wrapComponent: true,
  componentName: "Generated",
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
    const nodes: t.JSXElement[] = elements
      .map((el) => this.elementToJSX(el))
      .filter((el): el is t.JSXElement => el !== null);

    const inner =
      nodes.length > 0 ? nodes.map((n) => generate(n).code).join("\n") : "";

    let result = inner;
    if (options.wrapComponent) {
      const imports = generateImports(elements);

      const indentedInner = inner
        ? inner
            .split("\n")
            .map((line) => "      " + line)
            .join("\n")
        : "";

      result = `/**
 * Generated component
 * Note: TypeScript errors in Monaco editor are expected - the editor doesn't have full project context
 * This code will work correctly when used in your actual Next.js project
 */
${imports}

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

    return result;
  }
}

export const codeGenerator = CodeGenerator.getInstance();
