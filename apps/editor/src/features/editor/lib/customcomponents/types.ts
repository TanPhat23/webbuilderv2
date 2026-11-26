import type { ElementTemplate } from "@webbuilder/site-runtime/types/global.type";

export type CustomComponent = {
  component: ElementTemplate & {
    elements?: ElementTemplate[];
  };
};
