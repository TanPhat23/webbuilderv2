"use client";

import { EventHandler, EventActionConfig } from "@/interfaces/events.interface";
import {
  WorkflowData,
  WorkflowNode,
  Connection,
} from "@/components/editor/sidebar/eventworkflow/types/workflow.types";
import {
  EventType,
  EVENT_TYPES,
  ActionType,
  ACTION_TYPES,
} from "@/constants/events";

/**
 * Map of node IDs to workflow nodes for efficient lookup
 */
interface WorkflowNodeMap {
  [nodeId: string]: WorkflowNode;
}

/**
 * Transform workflow canvas data (nodes and connections) into EventHandler array
 *
 * This function is the main entry point for workflow transformation. It:
 * 1. Finds all trigger nodes (entry points for execution)
 * 2. For each trigger, creates separate handler chains for parallel paths
 * 3. Recursively builds handler chains with proper condition branching
 * 4. Prevents infinite loops using visited sets
 *
 * @param workflowData - The workflow canvas data containing nodes and connections
 * @returns Array of root-level EventHandler objects ready for execution
 *
 * @example
 * ```ts
 * const workflow = { nodes: [...], connections: [...] };
 * const handlers = transformWorkflowToEventHandlers(workflow);
 * // handlers can now be registered to element events
 * ```
 */
export function transformWorkflowToEventHandlers(
  workflowData: WorkflowData,
): EventHandler[] {
  if (!workflowData.nodes || workflowData.nodes.length === 0) {
    return [];
  }

  const nodeMap = createNodeMap(workflowData.nodes);
  const connectionMap = createConnectionMap(workflowData.connections || []);

  // Find trigger nodes (entry points)
  const triggerNodes = workflowData.nodes.filter(
    (node) => node.type === "trigger",
  );

  const handlers: EventHandler[] = [];

  // Process each trigger - supports multiple execution paths
  for (const triggerNode of triggerNodes) {
    const triggerEventType = getValidEventType(
      triggerNode.data?.config?.eventType,
    );

    // Get all nodes connected from this trigger (supports parallel paths)
    const nextNodeIds = connectionMap.get(triggerNode.id) || [];

    // Build handler chain for each path from trigger
    for (const nextNodeId of nextNodeIds) {
      const nextNode = nodeMap[nextNodeId];
      if (!nextNode) continue;

      const chain = buildHandlerChain(
        nextNode,
        nodeMap,
        connectionMap,
        triggerEventType,
        new Set(), // Fresh visited set for each path
      );

      if (chain) {
        handlers.push(chain);
      }
    }
  }

  return handlers;
}

/**
 * Create a map of node IDs to nodes for quick lookup
 */
function createNodeMap(nodes: WorkflowNode[]): WorkflowNodeMap {
  return nodes.reduce((map, node) => {
    map[node.id] = node;
    return map;
  }, {} as WorkflowNodeMap);
}

/**
 * Create a connection map for quick lookup of downstream nodes
 */
function createConnectionMap(connections: Connection[]): Map<string, string[]> {
  const map = new Map<string, string[]>();

  for (const connection of connections) {
    const sourceId = connection.source;
    if (!map.has(sourceId)) {
      map.set(sourceId, []);
    }
    map.get(sourceId)!.push(connection.target);
  }

  return map;
}

/**
 * Build a handler chain by traversing the workflow graph recursively
 *
 * This function creates a linked chain of event handlers by:
 * - Tracking visited nodes to prevent cycles
 * - Delegating to specialized handlers for actions and conditions
 * - Skipping trigger nodes (handled at root level)
 *
 * @param node - Current workflow node to process
 * @param nodeMap - Map of all nodes for lookup
 * @param connectionMap - Map of connections for traversal
 * @param eventType - Event type from the trigger
 * @param visited - Set of visited node IDs to prevent infinite loops
 * @returns EventHandler or null if node cannot be processed
 */
function buildHandlerChain(
  node: WorkflowNode,
  nodeMap: WorkflowNodeMap,
  connectionMap: Map<string, string[]>,
  eventType: EventType,
  visited: Set<string> = new Set(),
): EventHandler | null {
  // Prevent infinite loops
  if (visited.has(node.id)) {
    return null;
  }
  visited.add(node.id);

  // Trigger nodes should not appear in chains (handled at root level)
  if (node.type === "trigger") {
    return null;
  }

  // Create handler from action or condition node
  if (node.type === "action") {
    return createActionHandler(
      node,
      eventType,
      nodeMap,
      connectionMap,
      visited,
    );
  }

  if (node.type === "condition") {
    return createConditionHandler(
      node,
      eventType,
      nodeMap,
      connectionMap,
      visited,
    );
  }

  return null;
}

/**
 * Create an action handler from an action node
 *
 * Action handlers execute concrete actions (navigate, API call, etc.)
 * and chain to subsequent handlers using nextHandlers.
 *
 * @param node - Action workflow node
 * @param eventType - Event type from trigger
 * @param nodeMap - Map of all nodes
 * @param connectionMap - Map of connections
 * @param visited - Set of visited nodes
 * @returns EventHandler configured for the action
 */
function createActionHandler(
  node: WorkflowNode,
  eventType: EventType,
  nodeMap: WorkflowNodeMap,
  connectionMap: Map<string, string[]>,
  visited: Set<string>,
): EventHandler {
  const config = node.data?.config || {};
  const nextNodeIds = connectionMap.get(node.id) || [];
  const nextHandlers: EventHandler[] = [];

  // Build next handlers in chain
  for (const nextNodeId of nextNodeIds) {
    const nextNode = nodeMap[nextNodeId];
    if (nextNode && !visited.has(nextNodeId)) {
      const nextHandler = buildHandlerChain(
        nextNode,
        nodeMap,
        connectionMap,
        eventType,
        new Set(visited),
      );
      if (nextHandler) {
        nextHandlers.push(nextHandler);
      }
    }
  }

  // Get valid action type
  const actionType = getValidActionType(config.actionType);

  // Create properly typed config based on action type
  const eventActionConfig = createEventActionConfig(actionType, config);

  return {
    id: node.id,
    eventType,
    actionType,
    config: eventActionConfig,
    enabled: true,
    nextHandlers: nextHandlers.length > 0 ? nextHandlers : undefined,
  };
}

/**
 * Create a condition handler from a condition node
 *
 * Condition handlers evaluate boolean logic and branch execution:
 * - Uses customCode action type to execute condition logic
 * - Generates executable condition code from node config
 * - Builds trueHandlers for paths to execute when condition passes
 * - Builds falseHandlers for paths to execute when condition fails (future)
 *
 * Currently, all connected nodes are treated as true branch.
 * TODO: Support labeled ports for explicit true/false path routing
 *
 * @param node - Condition workflow node
 * @param eventType - Event type from trigger
 * @param nodeMap - Map of all nodes
 * @param connectionMap - Map of connections
 * @param visited - Set of visited nodes
 * @returns EventHandler with conditional branching logic
 */
function createConditionHandler(
  node: WorkflowNode,
  eventType: EventType,
  nodeMap: WorkflowNodeMap,
  connectionMap: Map<string, string[]>,
  visited: Set<string>,
): EventHandler {
  const config = node.data?.config || {};
  const nextNodeIds = connectionMap.get(node.id) || [];
  const trueHandlers: EventHandler[] = [];
  const falseHandlers: EventHandler[] = [];

  // Build handler chains for connected nodes
  // Currently all connections from condition node are treated as true branch
  // Future enhancement: Support connection port labels (sourceHandle: 'true'/'false')
  // to enable explicit true/false branch routing in the visual editor
  for (const nextNodeId of nextNodeIds) {
    const nextNode = nodeMap[nextNodeId];
    if (nextNode && !visited.has(nextNodeId)) {
      // Create fresh visited set for each branch to allow diamond patterns
      const nextHandler = buildHandlerChain(
        nextNode,
        nodeMap,
        connectionMap,
        eventType,
        new Set(visited), // Fresh copy prevents false-positive cycle detection
      );
      if (nextHandler) {
        trueHandlers.push(nextHandler);
      }
    }
  }

  // Generate executable condition code
  // The code returns a boolean that determines which branch to execute
  const eventActionConfig: EventActionConfig = {
    type: "customCode",
    code: generateConditionCode(config),
  };

  return {
    id: node.id,
    eventType,
    actionType: ACTION_TYPES.CUSTOM_CODE,
    config: eventActionConfig,
    enabled: true,
    // Conditional branching: executor will check result and execute appropriate branch
    trueHandlers: trueHandlers.length > 0 ? trueHandlers : undefined,
    falseHandlers: falseHandlers.length > 0 ? falseHandlers : undefined,
  };
}

/**
 * Create properly typed EventActionConfig based on action type
 *
 * This function ensures all action configs have valid defaults and proper types.
 * It mirrors the logic in workflowUtils.buildActionConfig but produces
 * EventActionConfig for runtime execution.
 *
 * @param actionType - The type of action to create config for
 * @param config - Base configuration object from workflow node
 * @returns Fully typed and validated EventActionConfig
 */
function createEventActionConfig(
  actionType: ActionType,
  config: Record<string, unknown>,
): EventActionConfig {
  switch (actionType) {
    case ACTION_TYPES.NAVIGATE:
      return {
        type: "navigate",
        value: String(config.value || ""),
        target: (config.target as "url" | "page" | "external") || "url",
        openInNewTab: Boolean(config.openInNewTab),
        replaceHistory: Boolean(config.replaceHistory),
      };

    case ACTION_TYPES.API_CALL:
      return {
        type: "apiCall",
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

    case ACTION_TYPES.SHOW_NOTIFICATION:
      return {
        type: "showNotification",
        message: String(config.message || ""),
        notificationType:
          (config.notificationType as
            | "success"
            | "error"
            | "info"
            | "warning") || "info",
      };

    case ACTION_TYPES.CUSTOM_CODE:
      return {
        type: "customCode",
        code: String(config.code || ""),
      };

    case ACTION_TYPES.SET_DATA:
      return {
        type: "setData",
        dataPath: String(config.dataPath || ""),
        value: config.value,
      };

    case ACTION_TYPES.SHOW_ELEMENT:
    case ACTION_TYPES.HIDE_ELEMENT:
    case ACTION_TYPES.TOGGLE_ELEMENT:
      return {
        type: actionType,
        elementId: String(config.elementId || ""),
        animationDuration: Number(config.animationDuration) || 300,
      };

    case ACTION_TYPES.SCROLL_TO:
      return {
        type: "scrollTo",
        target: (config.target as "elementId" | "position") || "elementId",
        value: String(config.value || ""),
        behavior: (config.behavior as "smooth" | "auto") || "smooth",
      };

    case ACTION_TYPES.MODAL:
      return {
        type: "modal",
        action: (config.action as "open" | "close") || "open",
        modalId: config.modalId as string,
      };

    case ACTION_TYPES.PLAY_ANIMATION:
      return {
        type: "playAnimation",
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

    case ACTION_TYPES.TOGGLE_CLASS:
    case ACTION_TYPES.ADD_CLASS:
    case ACTION_TYPES.REMOVE_CLASS:
      return {
        type: actionType,
        elementId: String(config.elementId || ""),
        className: String(config.className || ""),
      };

    case ACTION_TYPES.SUBMIT_FORM:
      return {
        type: "submitForm",
        formElementId: config.formElementId as string,
      };

    case ACTION_TYPES.RESET_FORM:
      return {
        type: "resetForm",
        formElementId: config.formElementId as string,
      };

    case ACTION_TYPES.COPY_TO_CLIPBOARD:
      return {
        type: "copyToClipboard",
        text: String(config.text || ""),
      };

    case ACTION_TYPES.DOWNLOAD_FILE:
      return {
        type: "downloadFile",
        url: String(config.url || ""),
        filename: config.filename as string,
      };

    default:
      // Fallback to custom code for unknown actions
      return {
        type: "customCode",
        code: `// Unknown action type: ${actionType}`,
      };
  }
}

/**
 * Generate executable JavaScript condition code from condition config
 *
 * The generated code is executed in a safe context with access to:
 * - state: Element state object
 * - element: DOM element
 *
 * @param config - Condition configuration from workflow node
 * @returns JavaScript code string that returns a boolean
 */
function generateConditionCode(config: Record<string, unknown>): string {
  const conditionType = config.conditionType as string;

  switch (conditionType) {
    case "always":
      return "return true;";

    case "stateEquals":
      const left = config.left as string;
      const right = config.right;
      const operator = config.operator as string;
      return `return state.${left} ${operator} ${JSON.stringify(right)};`;

    case "customCode":
      return String(config.customCode || "return false;");

    default:
      return "return false;";
  }
}

/**
 * Validate and return a valid EventType, with fallback to onClick
 *
 * @param eventTypeString - Event type string from workflow node
 * @returns Valid EventType constant
 */
function getValidEventType(eventTypeString: string | undefined): EventType {
  if (!eventTypeString) {
    return EVENT_TYPES.CLICK;
  }

  // Check if the string is a valid EventType
  const validEventTypes = Object.values(EVENT_TYPES);
  if (validEventTypes.includes(eventTypeString as EventType)) {
    return eventTypeString as EventType;
  }

  // Default to onClick if invalid
  return EVENT_TYPES.CLICK;
}

/**
 * Validate and return a valid ActionType, with fallback to navigate
 *
 * @param actionTypeString - Action type string from workflow node
 * @returns Valid ActionType constant
 */
function getValidActionType(actionTypeString: string | undefined): ActionType {
  if (!actionTypeString) {
    return ACTION_TYPES.NAVIGATE;
  }

  // Check if the string is a valid ActionType
  const validActionTypes = Object.values(ACTION_TYPES);
  if (validActionTypes.includes(actionTypeString as ActionType)) {
    return actionTypeString as ActionType;
  }

  // Default to navigate if invalid
  return ACTION_TYPES.NAVIGATE;
}

/**
 * Extract the trigger event type from workflow data
 *
 * @param workflowData - Complete workflow data
 * @returns Event type string from first trigger node, or 'onClick' as default
 */
export function getTriggerEventType(workflowData: WorkflowData): string {
  const triggerNode = workflowData.nodes?.find(
    (node) => node.type === "trigger",
  );
  return triggerNode?.data?.config?.eventType || "onClick";
}

