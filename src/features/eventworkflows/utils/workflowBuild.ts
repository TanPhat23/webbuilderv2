/**
 * Workflow Build Utilities
 * Helper functions for building and validating workflow node configurations
 *
 * This module provides utilities for:
 * - Building schema-compliant action configurations with defaults
 * - Validating workflow nodes
 * - Providing default configurations for new nodes
 *
 * @module workflowBuild
 */

import {
  WorkflowNode,
  NodeType,
} from "@/features/eventworkflows/components/types/workflow.types";

/**
 * Builds a schema-compliant action config based on action type
 *
 * This function ensures all action configurations have:
 * - Required fields with valid defaults
 * - Proper type conversions (String, Number, Boolean)
 * - Consistent structure across all action types
 *
 * Used primarily in the workflow editor UI to prepare configs before saving.
 * Mirrors the logic in workflowTransformer.createEventActionConfig but for
 * editor/builder context rather than runtime execution.
 *
 * @param actionType - The type of action (navigate, apiCall, etc.)
 * @param baseConfig - Base configuration object from UI
 * @returns Schema-compliant configuration with all required fields
 *
 * @example
 * ```ts
 * const config = buildActionConfig("navigate", { value: "/home" });
 * // Returns: { type: "navigate", target: "url", value: "/home", openInNewTab: false, replaceHistory: false }
 * ```
 */
export const buildActionConfig = (
  actionType: string,
  baseConfig: any,
): Record<string, any> => {
  const config = { type: actionType, ...baseConfig };

  switch (actionType) {
    case "navigate":
      return {
        ...config,
        value: String(config.value || ""),
        target: (config.target as "url" | "page" | "external") || "url",
        openInNewTab: Boolean(config.openInNewTab),
        replaceHistory: Boolean(config.replaceHistory),
      };

    case "apiCall":
      return {
        ...config,
        url: String(config.url || ""),
        method:
          (config.method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH") ||
          "GET",
        headers: (config.headers as Record<string, string>) || {},
        body: config.body as Record<string, unknown>,
        bodyType: (config.bodyType as "json" | "formData") || "json",
        storeResponseAs: config.storeResponseAs as string,
        timeout: Number(config.timeout) || 5000,
      };

    case "showNotification":
      return {
        ...config,
        message: String(config.message || ""),
        notificationType:
          (config.notificationType as
            | "success"
            | "error"
            | "info"
            | "warning") || "info",
      };

    case "customCode":
      return {
        ...config,
        code: String(config.code || ""),
      };

    case "setData":
      return {
        ...config,
        dataPath: String(config.dataPath || ""),
        value: config.value,
      };

    case "showElement":
    case "hideElement":
    case "toggleElement":
      return {
        ...config,
        elementId: String(config.elementId || ""),
        animationDuration: Number(config.animationDuration) || 300,
      };

    case "scrollTo":
      return {
        ...config,
        target: (config.target as "elementId" | "position") || "elementId",
        value: String(config.value || ""),
        behavior: (config.behavior as "smooth" | "auto") || "smooth",
      };

    case "modal":
      return {
        ...config,
        action: (config.action as "open" | "close") || "open",
        modalId: config.modalId as string,
      };

    case "playAnimation":
      return {
        ...config,
        elementId: String(config.elementId || ""),
        animationType:
          (config.animationType as
            | "fadeIn"
            | "slideIn"
            | "bounce"
            | "pulse"
            | "shake"
            | "spin") || "fadeIn",
        duration: Number(config.duration) || 1000,
      };

    case "toggleClass":
    case "addClass":
    case "removeClass":
      return {
        ...config,
        elementId: String(config.elementId || ""),
        className: String(config.className || ""),
      };

    case "submitForm":
      return {
        ...config,
        formElementId: config.formElementId as string,
      };

    case "resetForm":
      return {
        ...config,
        formElementId: config.formElementId as string,
      };

    case "copyToClipboard":
      return {
        ...config,
        text: String(config.text || ""),
      };

    case "downloadFile":
      return {
        ...config,
        url: String(config.url || ""),
        filename: config.filename as string,
      };

    default:
      // Return config as-is for unknown action types
      return config;
  }
};

/**
 * Validates that a workflow node has the required configuration for its type
 *
 * Validation rules:
 * - ACTION nodes must have actionType defined
 * - TRIGGER nodes must have eventType defined
 * - CONDITION nodes must have conditionType defined
 * - OUTPUT nodes always valid (no required config)
 *
 * @param node - Workflow node to validate
 * @returns true if node has valid configuration, false otherwise
 *
 * @example
 * ```ts
 * const isValid = validateWorkflowNode(actionNode);
 * if (!isValid) {
 *   console.error("Invalid node configuration");
 * }
 * ```
 */
export const validateWorkflowNode = (node: WorkflowNode): boolean => {
  switch (node.type) {
    case NodeType.ACTION:
      return !!node.data?.config?.actionType;
    case NodeType.TRIGGER:
      return !!node.data?.config?.eventType;
    case NodeType.CONDITION:
      return !!node.data?.config?.conditionType;
    case NodeType.OUTPUT:
      return true; // No specific config required
    default:
      return false;
  }
};

/**
 * Gets default configuration for a new node based on its type
 *
 * Provides sensible defaults for each node type:
 * - ACTION: Basic navigate action to example.com
 * - TRIGGER: onClick event
 * - CONDITION: Always true condition
 * - OUTPUT: Empty config (no requirements)
 *
 * These defaults help users get started quickly when adding new nodes
 * to the workflow canvas.
 *
 * @param nodeType - Type of node to get defaults for
 * @returns Default configuration object for the node type
 *
 * @example
 * ```ts
 * const defaults = getDefaultNodeConfig(NodeType.ACTION);
 * // Returns: { actionType: "navigate", target: "url", value: "https://example.com", openInNewTab: false }
 * ```
 */
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
