import { EventHandler, EventActionConfig } from "@/features/editor";
import {
  WorkflowData,
  WorkflowNode,
  Connection,
} from "@/features/eventworkflows/components/types/workflow.types";
import {
  EventType,
  EVENT_TYPES,
  ActionTypeEvent,
  ACTION_TYPES,
} from "@/features/editor";

type NodeMap = Record<string, WorkflowNode>;
type ConnectionMap = Map<string, string[]>;

export function transformWorkflowToEventHandlers(
  workflowData: WorkflowData,
): EventHandler[] {
  if (!workflowData.nodes?.length) return [];

  const nodeMap = buildNodeMap(workflowData.nodes);
  const connectionMap = buildConnectionMap(workflowData.connections ?? []);
  const triggerNodes = workflowData.nodes.filter((n) => n.type === "trigger");
  const handlers: EventHandler[] = [];

  for (const trigger of triggerNodes) {
    const eventType = resolveEventType(
      trigger.data?.config?.eventType as string | undefined,
    );
    const nextIds = connectionMap.get(trigger.id) ?? [];

    for (const nextId of nextIds) {
      const next = nodeMap[nextId];
      if (!next) continue;
      const chain = buildHandlerChain(
        next,
        nodeMap,
        connectionMap,
        eventType,
        new Set(),
      );
      if (chain) handlers.push(chain);
    }
  }

  return handlers;
}

export function getTriggerEventType(workflowData: WorkflowData): string {
  const trigger = workflowData.nodes?.find((n) => n.type === "trigger");
  return (trigger?.data?.config?.eventType as string | undefined) ?? "onClick";
}

function buildNodeMap(nodes: WorkflowNode[]): NodeMap {
  return Object.fromEntries(nodes.map((n) => [n.id, n])) as NodeMap;
}

function buildConnectionMap(connections: Connection[]): ConnectionMap {
  const map: ConnectionMap = new Map();
  for (const { source, target } of connections) {
    const existing = map.get(source) ?? [];
    map.set(source, [...existing, target]);
  }
  return map;
}

function buildHandlerChain(
  node: WorkflowNode,
  nodeMap: NodeMap,
  connectionMap: ConnectionMap,
  eventType: EventType,
  visited: Set<string>,
): EventHandler | null {
  if (visited.has(node.id) || node.type === "trigger") return null;
  visited.add(node.id);

  if (node.type === "action")
    return buildActionHandler(node, nodeMap, connectionMap, eventType, visited);
  if (node.type === "condition")
    return buildConditionHandler(
      node,
      nodeMap,
      connectionMap,
      eventType,
      visited,
    );
  return null;
}

function buildNextHandlers(
  nodeId: string,
  nodeMap: NodeMap,
  connectionMap: ConnectionMap,
  eventType: EventType,
  visited: Set<string>,
): EventHandler[] {
  const nextIds = connectionMap.get(nodeId) ?? [];
  return nextIds.flatMap((id) => {
    const node = nodeMap[id];
    if (!node || visited.has(id)) return [];
    const handler = buildHandlerChain(
      node,
      nodeMap,
      connectionMap,
      eventType,
      new Set(visited),
    );
    return handler ? [handler] : [];
  });
}

function buildActionHandler(
  node: WorkflowNode,
  nodeMap: NodeMap,
  connectionMap: ConnectionMap,
  eventType: EventType,
  visited: Set<string>,
): EventHandler {
  const config = node.data?.config ?? {};
  const actionType = resolveActionType(config.actionType);
  const nextHandlers = buildNextHandlers(
    node.id,
    nodeMap,
    connectionMap,
    eventType,
    visited,
  );

  return {
    id: node.id,
    eventType,
    actionType,
    config: buildActionConfig(actionType, config),
    enabled: true,
    nextHandlers: nextHandlers.length > 0 ? nextHandlers : undefined,
  };
}

function buildConditionHandler(
  node: WorkflowNode,
  nodeMap: NodeMap,
  connectionMap: ConnectionMap,
  eventType: EventType,
  visited: Set<string>,
): EventHandler {
  const config = node.data?.config ?? {};
  const trueHandlers = buildNextHandlers(
    node.id,
    nodeMap,
    connectionMap,
    eventType,
    visited,
  );

  const conditionConfig: EventActionConfig = {
    type: "customCode",
    code: generateConditionCode(config),
  };

  return {
    id: node.id,
    eventType,
    actionType: ACTION_TYPES.CUSTOM_CODE,
    config: conditionConfig,
    enabled: true,
    trueHandlers: trueHandlers.length > 0 ? trueHandlers : undefined,
  };
}

function buildActionConfig(
  actionType: ActionTypeEvent,
  config: Record<string, unknown>,
): EventActionConfig {
  switch (actionType) {
    case ACTION_TYPES.NAVIGATE:
      return {
        type: "navigate",
        value: String(config.value ?? ""),
        target: (config.target as "url" | "page" | "external") ?? "url",
        openInNewTab: Boolean(config.openInNewTab),
        replaceHistory: Boolean(config.replaceHistory),
      };

    case ACTION_TYPES.API_CALL:
      return {
        type: "apiCall",
        url: String(config.url ?? ""),
        method:
          (config.method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH") ??
          "GET",
        headers: (config.headers as Record<string, string>) ?? {},
        body: config.body as Record<string, unknown>,
        bodyType: (config.bodyType as "json" | "formData") ?? "json",
        storeResponseAs: config.storeResponseAs as string,
        timeout: Number(config.timeout) || 5000,
      };

    case ACTION_TYPES.SHOW_NOTIFICATION:
      return {
        type: "showNotification",
        message: String(config.message ?? ""),
        notificationType:
          (config.notificationType as
            | "success"
            | "error"
            | "info"
            | "warning") ?? "info",
      };

    case ACTION_TYPES.CUSTOM_CODE:
      return { type: "customCode", code: String(config.code ?? "") };

    case ACTION_TYPES.SET_DATA:
      return {
        type: "setData",
        dataPath: String(config.dataPath ?? ""),
        value: config.value,
      };

    case ACTION_TYPES.SHOW_ELEMENT:
    case ACTION_TYPES.HIDE_ELEMENT:
    case ACTION_TYPES.TOGGLE_ELEMENT:
      return {
        type: actionType,
        elementId: String(config.elementId ?? ""),
        animationDuration: Number(config.animationDuration) || 300,
      };

    case ACTION_TYPES.SCROLL_TO:
      return {
        type: "scrollTo",
        target: (config.target as "elementId" | "position") ?? "elementId",
        value: String(config.value ?? ""),
        behavior: (config.behavior as "smooth" | "auto") ?? "smooth",
      };

    case ACTION_TYPES.MODAL:
      return {
        type: "modal",
        action: (config.action as "open" | "close") ?? "open",
        modalId: config.modalId as string,
      };

    case ACTION_TYPES.PLAY_ANIMATION:
      return {
        type: "playAnimation",
        elementId: String(config.elementId ?? ""),
        animationType:
          (config.animationType as
            | "fadeIn"
            | "slideIn"
            | "bounce"
            | "pulse"
            | "shake"
            | "spin") ?? "fadeIn",
        duration: Number(config.duration) || 1000,
      };

    case ACTION_TYPES.TOGGLE_CLASS:
    case ACTION_TYPES.ADD_CLASS:
    case ACTION_TYPES.REMOVE_CLASS:
      return {
        type: actionType,
        elementId: String(config.elementId ?? ""),
        className: String(config.className ?? ""),
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
      return { type: "copyToClipboard", text: String(config.text ?? "") };

    case ACTION_TYPES.DOWNLOAD_FILE:
      return {
        type: "downloadFile",
        url: String(config.url ?? ""),
        filename: config.filename as string,
      };

    default:
      return {
        type: "customCode",
        code: `// Unknown action type: ${actionType}`,
      };
  }
}

function generateConditionCode(config: Record<string, unknown>): string {
  switch (config.conditionType as string) {
    case "always":
      return "return true;";
    case "stateEquals": {
      const { left, right, operator } = config as Record<string, unknown>;
      return `return state.${left} ${operator} ${JSON.stringify(right)};`;
    }
    case "customCode":
      return String(config.customCode ?? "return false;");
    default:
      return "return false;";
  }
}

function resolveValid<T extends string>(
  value: string | undefined,
  validValues: readonly T[],
  fallback: T,
): T {
  return value && (validValues as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function resolveEventType(value: string | undefined): EventType {
  return resolveValid(value, Object.values(EVENT_TYPES), EVENT_TYPES.CLICK);
}

function resolveActionType(value: unknown): ActionTypeEvent {
  return resolveValid(
    typeof value === "string" ? value : undefined,
    Object.values(ACTION_TYPES),
    ACTION_TYPES.NAVIGATE,
  );
}
