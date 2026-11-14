import { EditorElement } from "@/types/global.type";
import * as t from "@babel/types";
import { generate } from "@babel/generator";
import { generateStrategies, generationOptions } from "./generatestrategies";
import { hasInteractionCode, toCode, type CodegenInput } from "@/features/interactions/codegen/interactions";
import { generateImports } from "./generateImports";

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

  public async generateToJSX(elements: EditorElement[], logic?: InteractionLogic): Promise<string> {
    const withInteractions = hasInteractionCode(this.interactionInput(elements, logic));
    // Elements need `data-element-id` so the interactions module can find them.
    generationOptions.tagElementIds = withInteractions;
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
      const imports = generateImports(elements) + (withInteractions ? "\nimport { bindInteractions } from './interactions';" : "");

      const indentedInner = inner
        ? inner
            .split("\n")
            .map((line) => "      " + line)
            .join("\n")
        : "";

      result = `/**
 * Generated component
 * Note: TypeScript errors in Monaco editor are expected - the editor doesn't have full project context
 */
${imports}

const ${options.componentName} = () => {${withInteractions ? "\n  React.useEffect(() => bindInteractions(), []);\n" : ""}
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
