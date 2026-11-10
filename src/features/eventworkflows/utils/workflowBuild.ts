import { NodeType } from "@/features/eventworkflows/components/types/workflow.types";

export const getDefaultNodeConfig = (
  nodeType: NodeType,
): Record<string, any> => {
  switch (nodeType) {
    case NodeType.ACTION:
      return {
        actionType: "navigate",
        target: "url",
        value: "https://example.com",
        openInNewTab: false,
      };
    case NodeType.TRIGGER:
      return {
        eventType: "onClick",
      };
    case NodeType.CONDITION:
      return {
        conditionType: "always",
      };
    case NodeType.OUTPUT:
      return {};
    default:
      return {};
  }
};
