/** True on Apple platforms, where Cmd is the shortcut modifier and Ctrl+click is a right-click. */
export const IS_APPLE =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform);
