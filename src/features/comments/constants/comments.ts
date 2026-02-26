// Scroll area dimensions
export const COMMENTS_SCROLL_HEIGHT = "h-[450px]";

// Animation timings
export const COMMENT_ANIMATION = {
  duration: 0.2,
  ease: "easeOut",
};

// View modes
export const COMMENT_VIEW_MODES = {
  ALL: "all",
  UNRESOLVED: "unresolved",
  RESOLVED: "resolved",
} as const;

// Sort orders
export const COMMENT_SORT_ORDERS = {
  NEWEST: "newest",
  OLDEST: "oldest",
} as const;

// Panel dimensions
export const COMMENTS_PANEL = {
  WIDTH: "w-1/4",
  POSITION: "fixed right-4 top-20 z-50",
} as const;

// Button icons and sizes
export const COMMENT_BUTTON = {
  SIZE: "sm",
  ICON_SIZE: "h-8 w-8",
} as const;

// Empty state messages
export const EMPTY_STATE_MESSAGES = {
  NO_ACTIVE_COMMENTS: "No active comments",
  NO_RESOLVED_COMMENTS: "No resolved comments",
  NO_COMMENTS: "No comments yet",
  START_CONVERSATION: "Start the conversation!",
  SELECT_ELEMENT: "Select an element",
  SELECT_ELEMENT_DESCRIPTION: "Click on an element or focus button to add comments",
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  SEND_COMMENT: { key: "Enter", modifiers: ["meta", "ctrl"] },
} as const;

// Validation
export const COMMENT_VALIDATION = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 5000,
} as const;

// Confirmation messages
export const CONFIRMATION_MESSAGES = {
  DELETE_COMMENT: "Are you sure you want to delete this comment?",
} as const;
