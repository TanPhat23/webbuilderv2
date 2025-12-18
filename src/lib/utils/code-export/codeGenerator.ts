import { EditorElement } from "@/types/global.type";
import { Page } from "@/interfaces/page.interface";
import {
  GeneratedCode,
  BaseCodeGenerator,
} from "./codeGeneratorBase";
import { HTMLCodeGenerator, ReactCodeGenerator } from "./codeGenerators";

export type { GeneratedCode };

export interface CodeGenerationOptions {
  includeTailwind?: boolean;
  responsiveBreakpoints?: boolean;
  minify?: boolean;
  exportFormat?: "html" | "react" | "vue" | "angular";
  page?: Page;
}

class CodeGeneratorFactory {
  static createGenerator(
    options: CodeGenerationOptions = {},
  ): BaseCodeGenerator {
    const exportFormat = options.exportFormat || "html";

    switch (exportFormat) {
      case "react":
        return new ReactCodeGenerator(options);
      case "html":
      default:
        return new HTMLCodeGenerator(options);
    }
  }
}

export async function generateCodeFromElements(
  elements: EditorElement[],
  options?: CodeGenerationOptions,
): Promise<GeneratedCode> {
  const generator = CodeGeneratorFactory.createGenerator(options);
  return await generator.generateCode(elements);
}

export default CodeGeneratorFactory;
