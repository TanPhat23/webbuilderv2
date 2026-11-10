import { NodeType } from "@/features/eventworkflows/types/workflow.types";
import {
  NODE_META,
  NODE_TYPES_ORDER,
  NodeIcon,
  resolveNodeIcon,
  type CanvasNodeType,
  type NodeMetadata,
  type NodeTypeColors,
} from "./nodeMeta";

export {
  NODE_META,
  NODE_TYPES_ORDER,
  NodeIcon,
  resolveNodeIcon,
  type CanvasNodeType,
  type NodeMetadata,
  type NodeTypeColors,
};

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  [NodeType.TRIGGER]: NODE_META[NodeType.TRIGGER].label,
  [NodeType.ACTION]: NODE_META[NodeType.ACTION].label,
  [NodeType.CONDITION]: NODE_META[NodeType.CONDITION].label,
  [NodeType.OUTPUT]: NODE_META[NodeType.OUTPUT].label,
  [NodeType.ELEMENT]: "Element",
};

export const NODE_TYPE_DESCRIPTIONS: Record<NodeType, string> = {
  [NodeType.TRIGGER]: NODE_META[NodeType.TRIGGER].description,
  [NodeType.ACTION]: NODE_META[NodeType.ACTION].description,
  [NodeType.CONDITION]: NODE_META[NodeType.CONDITION].description,
  [NodeType.OUTPUT]: NODE_META[NodeType.OUTPUT].description,
  [NodeType.ELEMENT]: "Canvas element event source",
};

export const NODE_TYPE_COLORS = {
  trigger: NODE_META[NodeType.TRIGGER].colors,
  action: NODE_META[NodeType.ACTION].colors,
  condition: NODE_META[NodeType.CONDITION].colors,
  output: NODE_META[NodeType.OUTPUT].colors,
} as const;

export const WORKFLOW_EVENT_TYPES = [
  {
    value: "onClick",
    label: "On Click",
    description: "When element is clicked",
    category: "user-interaction",
  },
  {
    value: "onDoubleClick",
    label: "On Double Click",
    description: "When element is double-clicked",
    category: "user-interaction",
  },
  {
    value: "onMouseEnter",
    label: "On Mouse Enter",
    description: "When mouse enters element",
    category: "mouse-event",
  },
  {
    value: "onMouseLeave",
    label: "On Mouse Leave",
    description: "When mouse leaves element",
    category: "mouse-event",
  },
  {
    value: "onSubmit",
    label: "On Submit",
    description: "When form is submitted",
    category: "form-event",
  },
  {
    value: "onChange",
    label: "On Change",
    description: "When input value changes",
    category: "form-event",
  },
  {
    value: "onFocus",
    label: "On Focus",
    description: "When element receives focus",
    category: "focus-event",
  },
  {
    value: "onBlur",
    label: "On Blur",
    description: "When element loses focus",
    category: "focus-event",
  },
] as const;

export const EVENT_CATEGORIES = {
  "user-interaction": {
    label: "User Interaction",
    icon: "Zap",
  },
  "mouse-event": {
    label: "Mouse Events",
    icon: "Mouse",
  },
  "form-event": {
    label: "Form Events",
    icon: "FormInput",
  },
  "focus-event": {
    label: "Focus Events",
    icon: "Focus",
  },
} as const;

export const WORKFLOW_VALIDATION_RULES = {
  minNodes: 1,
  maxNodes: 100,
  maxConnections: 500,
  maxNameLength: 255,
  maxDescriptionLength: 1000,
} as const;

export const WORKFLOW_DEFAULTS = {
  zoom: 1,
  panX: 0,
  panY: 0,
  gridSize: 50,
  nodeSpacing: 200,
} as const;

export const CANVAS_CONFIG = {
  minZoom: 0.1,
  maxZoom: 4,
  zoomStep: 1.2,
  panSensitivity: 1,
  defaultGridOpacity: 0.2,
} as const;

export const NODE_DIMENSIONS = {
  width: 192,
  height: 120,
  portRadius: 6,
  portOffset: 60,
} as const;

export const CONNECTION_CONFIG = {
  strokeWidth: {
    default: 2,
    active: 3,
    hover: 2.5,
  },
  // Use CSS variables / theme tokens so connection colors follow the app theme
  // and respond to light/dark modes defined in globals.css.
  colors: {
    default: "var(--color-border)",
    selected: "var(--color-accent)",
    delete: "var(--color-destructive)",
    error: "var(--color-destructive)",
  },
  opacity: {
    default: 0.6,
    active: 1,
    disabled: 0.3,
  },
} as const;

export const HANDLE_POSITIONS = {
  trigger: {
    source: true,
    target: false,
  },
  action: {
    source: true,
    target: true,
  },
  condition: {
    source: true,
    target: true,
  },
  output: {
    source: false,
    target: true,
  },
} as const;

export const VALIDATION_ERRORS = {
  selfConnection: "Cannot connect a node to itself",
  triggerAsTarget: "Cannot connect to TRIGGER nodes",
  outputAsSource: "Cannot connect from OUTPUT nodes",
  duplicateConnection: "This connection already exists",
  maxConnectionsReached: "Maximum number of connections reached",
  invalidNodeType: "Invalid node type",
  missingRequiredField: "Missing required field",
} as const;

export const WORKFLOW_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
  ACTIVE: "active",
  PAUSED: "paused",
} as const;

export const WORKFLOW_EXECUTION_STATUS = {
  IDLE: "idle",
  RUNNING: "running",
  SUCCESS: "success",
  ERROR: "error",
  CANCELLED: "cancelled",
} as const;

export const CANVAS_KEYBOARD_SHORTCUTS = {
  DELETE: ["Delete", "Backspace"],
  SELECT_ALL: ["Control+a", "Meta+a"],
  ZOOM_IN: ["Control+Plus", "Meta+Plus"],
  ZOOM_OUT: ["Control+Minus", "Meta+Minus"],
  RESET_VIEW: ["Control+0", "Meta+0"],
  COPY: ["Control+c", "Meta+c"],
  PASTE: ["Control+v", "Meta+v"],
  UNDO: ["Control+z", "Meta+z"],
  REDO: ["Control+Shift+z", "Meta+Shift+z"],
} as const;

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const DEFAULT_NODE_CONFIG: Record<NodeType, Record<string, any>> = {
  [NodeType.TRIGGER]: {
    timeout: 5000,
    retryCount: 3,
  },
  [NodeType.ACTION]: {
    async: true,
    timeout: 10000,
    retryCount: 3,
  },
  [NodeType.CONDITION]: {
    operators: ["==", "!=", ">", "<", ">=", "<=", "contains"],
    timeout: 5000,
  },
  [NodeType.OUTPUT]: {
    format: "json",
    includeMetadata: true,
  },
  [NodeType.ELEMENT]: {},
} as const;

export const getNodeTypeColor = (nodeType: NodeType) => {
  const colorMap: Record<NodeType, keyof typeof NODE_TYPE_COLORS> = {
    [NodeType.TRIGGER]: "trigger",
    [NodeType.ACTION]: "action",
    [NodeType.CONDITION]: "condition",
    [NodeType.OUTPUT]: "output",
    [NodeType.ELEMENT]: "trigger",
  };
  return NODE_TYPE_COLORS[colorMap[nodeType]];
};

export const getEventTypesByCategory = (
  category: keyof typeof EVENT_CATEGORIES,
) => {
  return WORKFLOW_EVENT_TYPES.filter((event) => event.category === category);
};

export const isValidConnection = (
  sourceType: NodeType,
  targetType: NodeType,
  sourceId: string,
  targetId: string,
): {
  valid: boolean;
  error?: string;
} => {
  if (sourceId === targetId) {
    return { valid: false, error: VALIDATION_ERRORS.selfConnection };
  }

  if (targetType === NodeType.TRIGGER) {
    return { valid: false, error: VALIDATION_ERRORS.triggerAsTarget };
  }

  if (sourceType === NodeType.OUTPUT) {
    return { valid: false, error: VALIDATION_ERRORS.outputAsSource };
  }

  return { valid: true };
};

export const canNodeHaveConnections = (nodeType: NodeType) => {
  return HANDLE_POSITIONS[nodeType as keyof typeof HANDLE_POSITIONS];
};
