/**
 * Event System Constants and Types
 * Centralized constants and type definitions for all event-related types
 */

// ============================================
// EVENT TYPES
// ============================================

export const EVENT_TYPES = {
  CLICK: "onClick",
  DOUBLE_CLICK: "onDoubleClick",
  MOUSE_ENTER: "onMouseEnter",
  MOUSE_LEAVE: "onMouseLeave",
  MOUSE_DOWN: "onMouseDown",
  MOUSE_UP: "onMouseUp",
  FOCUS: "onFocus",
  BLUR: "onBlur",
  CHANGE: "onChange",
  SUBMIT: "onSubmit",
  KEY_DOWN: "onKeyDown",
  KEY_UP: "onKeyUp",
  SCROLL: "onScroll",
  LOAD: "onLoad",
  ERROR: "onError",
} as const;

export type EventTypeEvent = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

// ============================================
// ACTION TYPES
// ============================================

export const ACTION_TYPES = {
  NAVIGATE: "navigate",
  SHOW_ELEMENT: "showElement",
  HIDE_ELEMENT: "hideElement",
  TOGGLE_ELEMENT: "toggleElement",
  API_CALL: "apiCall",
  SET_DATA: "setData",
  CUSTOM_CODE: "customCode",
  SCROLL_TO: "scrollTo",
  MODAL: "modal",
  SUBMIT_FORM: "submitForm",
  RESET_FORM: "resetForm",
  PLAY_ANIMATION: "playAnimation",
  SHOW_NOTIFICATION: "showNotification",
  COPY_TO_CLIPBOARD: "copyToClipboard",
  DOWNLOAD_FILE: "downloadFile",
  TOGGLE_CLASS: "toggleClass",
  ADD_CLASS: "addClass",
  REMOVE_CLASS: "removeClass",
} as const;

export type ActionTypeEvent = (typeof ACTION_TYPES)[keyof typeof ACTION_TYPES];

// ============================================
// HTTP METHODS
// ============================================

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
} as const;

export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

// ============================================
// NAVIGATE TARGETS
// ============================================

export const NAVIGATE_TARGETS = {
  URL: "url",
  PAGE: "page",
  EXTERNAL: "external",
} as const;

export type NavigateTarget =
  (typeof NAVIGATE_TARGETS)[keyof typeof NAVIGATE_TARGETS];

// ============================================
// ANIMATION TYPES
// ============================================

export const ANIMATION_TYPES = {
  FADE_IN: "fadeIn",
  SLIDE_IN: "slideIn",
  BOUNCE: "bounce",
  PULSE: "pulse",
  SHAKE: "shake",
  SPIN: "spin",
} as const;

export type AnimationType =
  (typeof ANIMATION_TYPES)[keyof typeof ANIMATION_TYPES];

// ============================================
// NOTIFICATION TYPES
// ============================================

export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  WARNING: "warning",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

// ============================================
// SCROLL BEHAVIOR
// ============================================

export const SCROLL_BEHAVIORS = {
  SMOOTH: "smooth",
  AUTO: "auto",
} as const;

export type ScrollBehavior =
  (typeof SCROLL_BEHAVIORS)[keyof typeof SCROLL_BEHAVIORS];

// ============================================
// SCROLL TARGET
// ============================================

export const SCROLL_TARGETS = {
  ELEMENT_ID: "elementId",
  POSITION: "position",
} as const;

export type ScrollTarget = (typeof SCROLL_TARGETS)[keyof typeof SCROLL_TARGETS];

// ============================================
// MODAL ACTIONS
// ============================================

export const MODAL_ACTIONS = {
  OPEN: "open",
  CLOSE: "close",
} as const;

export type ModalAction = (typeof MODAL_ACTIONS)[keyof typeof MODAL_ACTIONS];

// ============================================
// DATA VALUE TYPES
// ============================================

export const DATA_VALUE_TYPES = {
  STATIC: "static",
  DYNAMIC: "dynamic",
  EVENT: "event",
} as const;

export type DataValueType =
  (typeof DATA_VALUE_TYPES)[keyof typeof DATA_VALUE_TYPES];

// ============================================
// EVENT VALUE SOURCES
// ============================================

export const EVENT_VALUE_SOURCES = {
  TARGET_VALUE: "target.value",
  TARGET_CHECKED: "target.checked",
  TARGET_FILES: "target.files",
} as const;

export type EventValueSource =
  (typeof EVENT_VALUE_SOURCES)[keyof typeof EVENT_VALUE_SOURCES];

// ============================================
// CONDITION TYPES
// ============================================

export const CONDITION_TYPES = {
  STATE_EQUALS: "stateEquals",
  STATE_CHECK: "stateCheck",
  CUSTOM_CODE: "customCode",
  ALWAYS: "always",
} as const;

export type ConditionType =
  (typeof CONDITION_TYPES)[keyof typeof CONDITION_TYPES];

// ============================================
// CONDITION OPERATORS
// ============================================

export const CONDITION_OPERATORS = {
  EQUALS: "==",
  NOT_EQUALS: "!=",
  GREATER_THAN: ">",
  LESS_THAN: "<",
  GREATER_THAN_OR_EQUAL: ">=",
  LESS_THAN_OR_EQUAL: "<=",
  INCLUDES: "includes",
  NOT_INCLUDES: "notIncludes",
} as const;

export type ConditionOperatorEvent =
  (typeof CONDITION_OPERATORS)[keyof typeof CONDITION_OPERATORS];

// ============================================
// BODY TYPES
// ============================================

export const BODY_TYPES = {
  JSON: "json",
  FORM_DATA: "formData",
} as const;

export type BodyType = (typeof BODY_TYPES)[keyof typeof BODY_TYPES];

// ============================================
// CONSTANT MAPS
// ============================================

/**
 * Event type display names
 */
export const EVENT_TYPE_LABELS: Record<EventTypeEvent, string> = {
  [EVENT_TYPES.CLICK]: "Click",
  [EVENT_TYPES.DOUBLE_CLICK]: "Double Click",
  [EVENT_TYPES.MOUSE_ENTER]: "Mouse Enter",
  [EVENT_TYPES.MOUSE_LEAVE]: "Mouse Leave",
  [EVENT_TYPES.MOUSE_DOWN]: "Mouse Down",
  [EVENT_TYPES.MOUSE_UP]: "Mouse Up",
  [EVENT_TYPES.FOCUS]: "Focus",
  [EVENT_TYPES.BLUR]: "Blur",
  [EVENT_TYPES.CHANGE]: "Change",
  [EVENT_TYPES.SUBMIT]: "Submit",
  [EVENT_TYPES.KEY_DOWN]: "Key Down",
  [EVENT_TYPES.KEY_UP]: "Key Up",
  [EVENT_TYPES.SCROLL]: "Scroll",
  [EVENT_TYPES.LOAD]: "Load",
  [EVENT_TYPES.ERROR]: "Error",
};

/**
 * Action type display names
 */
export const ACTION_TYPE_LABELS: Record<ActionTypeEvent, string> = {
  [ACTION_TYPES.NAVIGATE]: "Navigate",
  [ACTION_TYPES.SHOW_ELEMENT]: "Show Element",
  [ACTION_TYPES.HIDE_ELEMENT]: "Hide Element",
  [ACTION_TYPES.TOGGLE_ELEMENT]: "Toggle Element",
  [ACTION_TYPES.API_CALL]: "API Call",
  [ACTION_TYPES.SET_DATA]: "Set Data",
  [ACTION_TYPES.CUSTOM_CODE]: "Custom Code",
  [ACTION_TYPES.SCROLL_TO]: "Scroll To",
  [ACTION_TYPES.MODAL]: "Modal",
  [ACTION_TYPES.SUBMIT_FORM]: "Submit Form",
  [ACTION_TYPES.RESET_FORM]: "Reset Form",
  [ACTION_TYPES.PLAY_ANIMATION]: "Play Animation",
  [ACTION_TYPES.SHOW_NOTIFICATION]: "Show Notification",
  [ACTION_TYPES.COPY_TO_CLIPBOARD]: "Copy to Clipboard",
  [ACTION_TYPES.DOWNLOAD_FILE]: "Download File",
  [ACTION_TYPES.TOGGLE_CLASS]: "Toggle Class",
  [ACTION_TYPES.ADD_CLASS]: "Add Class",
  [ACTION_TYPES.REMOVE_CLASS]: "Remove Class",
};

/**
 * Animation type display names
 */
export const ANIMATION_TYPE_LABELS: Record<AnimationType, string> = {
  [ANIMATION_TYPES.FADE_IN]: "Fade In",
  [ANIMATION_TYPES.SLIDE_IN]: "Slide In",
  [ANIMATION_TYPES.BOUNCE]: "Bounce",
  [ANIMATION_TYPES.PULSE]: "Pulse",
  [ANIMATION_TYPES.SHAKE]: "Shake",
  [ANIMATION_TYPES.SPIN]: "Spin",
};

/**
 * Notification type display names
 */
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NOTIFICATION_TYPES.SUCCESS]: "Success",
  [NOTIFICATION_TYPES.ERROR]: "Error",
  [NOTIFICATION_TYPES.INFO]: "Info",
  [NOTIFICATION_TYPES.WARNING]: "Warning",
};

/**
 * HTTP method display names
 */
export const HTTP_METHOD_LABELS: Record<HttpMethod, string> = {
  [HTTP_METHODS.GET]: "GET",
  [HTTP_METHODS.POST]: "POST",
  [HTTP_METHODS.PUT]: "PUT",
  [HTTP_METHODS.DELETE]: "DELETE",
  [HTTP_METHODS.PATCH]: "PATCH",
};

/**
 * Condition operator display names
 */
export const CONDITION_OPERATOR_LABELS: Record<ConditionOperatorEvent, string> =
  {
    [CONDITION_OPERATORS.EQUALS]: "Equals",
    [CONDITION_OPERATORS.NOT_EQUALS]: "Not Equals",
    [CONDITION_OPERATORS.GREATER_THAN]: "Greater Than",
    [CONDITION_OPERATORS.LESS_THAN]: "Less Than",
    [CONDITION_OPERATORS.GREATER_THAN_OR_EQUAL]: "Greater Than or Equal",
    [CONDITION_OPERATORS.LESS_THAN_OR_EQUAL]: "Less Than or Equal",
    [CONDITION_OPERATORS.INCLUDES]: "Includes",
    [CONDITION_OPERATORS.NOT_INCLUDES]: "Not Includes",
  };

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get all event type values as an array
 */
export function getEventTypeValues(): EventTypeEvent[] {
  return Object.values(EVENT_TYPES);
}

/**
 * Get all action type values as an array
 */
export function getActionTypeEventValues(): ActionTypeEvent[] {
  return Object.values(ACTION_TYPES);
}

/**
 * Get all animation type values as an array
 */
export function getAnimationTypeValues(): AnimationType[] {
  return Object.values(ANIMATION_TYPES);
}

/**
 * Get all notification type values as an array
 */
export function getNotificationTypeValues(): NotificationType[] {
  return Object.values(NOTIFICATION_TYPES);
}

/**
 * Get all HTTP method values as an array
 */
export function getHttpMethodValues(): HttpMethod[] {
  return Object.values(HTTP_METHODS);
}

/**
 * Get all condition operator values as an array
 */
export function getConditionOperatorEventValues(): ConditionOperatorEvent[] {
  return Object.values(CONDITION_OPERATORS);
}

/**
 * Check if a value is a valid event type
 */
export function isValidEventType(value: unknown): value is EventTypeEvent {
  return Object.values(EVENT_TYPES).includes(value as EventTypeEvent);
}

/**
 * Check if a value is a valid action type
 */
export function isValidActionTypeEvent(
  value: unknown,
): value is ActionTypeEvent {
  return Object.values(ACTION_TYPES).includes(value as ActionTypeEvent);
}

/**
 * Check if a value is a valid animation type
 */
export function isValidAnimationType(value: unknown): value is AnimationType {
  return Object.values(ANIMATION_TYPES).includes(value as AnimationType);
}

/**
 * Check if a value is a valid notification type
 */
export function isValidNotificationType(
  value: unknown,
): value is NotificationType {
  return Object.values(NOTIFICATION_TYPES).includes(value as NotificationType);
}

/**
 * Check if a value is a valid HTTP method
 */
export function isValidHttpMethod(value: unknown): value is HttpMethod {
  return Object.values(HTTP_METHODS).includes(value as HttpMethod);
}

/**
 * Check if a value is a valid condition operator
 */
export function isValidConditionOperatorEvent(
  value: unknown,
): value is ConditionOperatorEvent {
  return Object.values(CONDITION_OPERATORS).includes(
    value as ConditionOperatorEvent,
  );
}
