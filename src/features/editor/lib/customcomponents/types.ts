import type { ElementTemplate } from "@/types/global.type";

export type CustomComponent = {
  component: ElementTemplate & {
    elements?: ElementTemplate[];
  };
};
