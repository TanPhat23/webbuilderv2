/**
 * Event System for Web Builder
 * Handles element interactions like click, hover, etc.
 */

// ============================================
// EVENT TYPES
// ============================================

export type EventType =
  | "onClick"
  | "onDoubleClick"
  | "onMouseEnter"
  | "onMouseLeave"
  | "onMouseDown"
  | "onMouseUp"
  | "onFocus"
  | "onBlur"
  | "onChange"
  | "onSubmit"
  | "onKeyDown"
  | "onKeyUp"
  | "onScroll"
  | "onLoad"
  | "onError";

// ============================================
// ACTION TYPES
// ============================================

export type ActionType =
  | "navigate"
  | "showElement"
  | "hideElement"
  | "toggleElement"
  | "apiCall"
  | "setData"
  | "customCode"
  | "scrollTo"
  | "modal"
  | "submitForm"
  | "resetForm"
  | "playAnimation"
  | "showNotification"
  | "copyToClipboard"
  | "downloadFile"
  | "toggleClass"
  | "addClass"
  | "removeClass";

// ============================================
// ACTION CONFIGURATIONS
// ============================================

export interface NavigateActionConfig {
  type: "navigate";
  target: "url" | "page" | "external";
  value: string;
  openInNewTab?: boolean;
  replaceHistory?: boolean;
}

export interface ToggleElementActionConfig {
  type: "showElement" | "hideElement" | "toggleElement";
  elementId: string;
  animationDuration?: number;
}

export interface ApiCallActionConfig {
  type: "apiCall";
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: Record<string, any>;
  bodyType?: "json" | "formData";
  storeResponseAs?: string;
  onSuccess?: EventHandler[];
  onError?: EventHandler[];
  timeout?: number;
}

export interface SetDataActionConfig {
  type: "setData";
  dataPath: string;
  value?: any;
  valueType?: "static" | "dynamic" | "event";
  fromElement?: string;
  fromAPI?: string;
  fromEvent?: "target.value" | "target.checked" | "target.files";
}

export interface CustomCodeActionConfig {
  type: "customCode";
  code: string;
}

export interface ScrollActionConfig {
  type: "scrollTo";
  target: "elementId" | "position";
  value: string | number;
  behavior?: "smooth" | "auto";
  offsetY?: number;
}

export interface ModalActionConfig {
  type: "modal";
  action: "open" | "close";
  modalId?: string;
}

export interface NotificationActionConfig {
  type: "showNotification";
  message: string;
  notificationType?: "success" | "error" | "info" | "warning";
  duration?: number;
}

export interface CopyToClipboardActionConfig {
  type: "copyToClipboard";
  text: string;
  successMessage?: string;
}

export interface DownloadActionConfig {
  type: "downloadFile";
  url: string;
  filename?: string;
}

export interface AnimationActionConfig {
  type: "playAnimation";
  elementId: string;
  animationType: "fadeIn" | "slideIn" | "bounce" | "pulse" | "shake" | "spin";
  duration?: number;
  delay?: number;
}

export interface FormActionConfig {
  type: "submitForm" | "resetForm";
  formElementId?: string;
}

export interface ToggleClassActionConfig {
  type: "toggleClass" | "addClass" | "removeClass";
  elementId: string;
  className: string;
  animationDuration?: number;
}

// Union of all action configs
export type EventActionConfig =
  | NavigateActionConfig
  | ToggleElementActionConfig
  | ApiCallActionConfig
  | SetDataActionConfig
  | CustomCodeActionConfig
  | ScrollActionConfig
  | ModalActionConfig
  | NotificationActionConfig
  | CopyToClipboardActionConfig
  | DownloadActionConfig
  | AnimationActionConfig
  | FormActionConfig
  | ToggleClassActionConfig;

// ============================================
// CONDITIONS
// ============================================

export type ConditionOperator =
  | "=="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "includes"
  | "notIncludes";

export interface EventCondition {
  id: string;
  type: "stateEquals" | "stateCheck" | "customCode" | "always";
  left?: string;
  operator?: ConditionOperator;
  right?: any;
  customCode?: string;
}

// ============================================
// EVENT HANDLER
// ============================================

export interface EventHandler {
  id: string;
  eventType: EventType;
  actionType: ActionType;
  enabled?: boolean;
  config: EventActionConfig;
  delay?: number;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  conditions?: EventCondition[];
  nextHandlers?: EventHandler[];
  trueHandlers?: EventHandler[];
  falseHandlers?: EventHandler[];
}

// ============================================
// ELEMENT EVENT COLLECTION
// ============================================

export interface ElementEvents {
  [eventType: string]: EventHandler[];
}

// ============================================
// CONTEXT & EXECUTION
// ============================================

export interface EventExecutionContext {
  element: any;
  event?: Event | React.SyntheticEvent;
  elementState: Record<string, any>;
  globalState?: Record<string, any>;
  elementInstance?: any;
}

// ============================================
// EVENT REGISTRY
// ============================================

export interface EventRegistry {
  elementId: string;
  events: ElementEvents;
  createdAt: Date;
  updatedAt: Date;
}
