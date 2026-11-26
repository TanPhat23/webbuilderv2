import type React from "react";

/** Marks the element that opens the editor context menu (the trigger wrapper). */
export const CONTEXT_MENU_TRIGGER_ATTR = "data-editor-context-trigger";

export interface ScreenPoint {
  readonly x: number;
  readonly y: number;
}

/** Maps a point in iframe viewport pixels to editor-window client pixels. */
export function projectIframeClientToScreen(
  point: ScreenPoint,
  frameRect: { readonly left: number; readonly top: number },
  zoom: number,
): ScreenPoint {
  return { x: frameRect.left + point.x * zoom, y: frameRect.top + point.y * zoom };
}

export interface SiteContextMenuHandlers {
  readonly onContextMenuCapture: (event: React.MouseEvent) => void;
  readonly onContextMenu: (event: React.MouseEvent) => void;
}

export interface SiteContextMenuOptions {
  readonly iframeEl: HTMLIFrameElement | null;
  readonly zoom: number;
  /** False when no menu is mounted for this user: leave the event alone. */
  readonly menuEnabled: boolean;
  readonly handlers: SiteContextMenuHandlers;
}

function isInIframeRealm(event: React.MouseEvent, iframeEl: HTMLIFrameElement): boolean {
  const target = event.target;
  return (
    target !== null &&
    typeof target === "object" &&
    "ownerDocument" in target &&
    target.ownerDocument !== iframeEl.ownerDocument
  );
}

/**
 * Capture-phase context-menu routing for the site portal.
 *
 * React dispatches the capture and bubble phases from two separate native
 * listeners, so mutating this event cannot change what the Radix trigger's
 * bubble-phase handler reads. Instead the native event is consumed here, the
 * controller's selection logic runs against it, and a fresh contextmenu event
 * carrying editor-window coordinates is dispatched on the trigger element.
 */
export function routeSiteContextMenu(
  event: React.MouseEvent,
  { iframeEl, zoom, menuEnabled, handlers }: SiteContextMenuOptions,
): void {
  handlers.onContextMenuCapture(event);
  if (!menuEnabled || !iframeEl || !isInIframeRealm(event, iframeEl)) return;

  const trigger = iframeEl.closest<HTMLElement>(`[${CONTEXT_MENU_TRIGGER_ATTR}]`);
  const view = trigger?.ownerDocument.defaultView;

  // Selection runs here because the native bubble phase is about to be consumed.
  handlers.onContextMenu(event);
  // The controller prevents the default when nothing selectable was hit.
  const suppressed = event.isDefaultPrevented();

  // The native event must never reach the bubble phase with iframe coordinates.
  const native = event.nativeEvent;
  native.preventDefault();
  native.stopPropagation();
  if (suppressed || !trigger || !view) return;

  const point = projectIframeClientToScreen(
    { x: event.clientX, y: event.clientY },
    iframeEl.getBoundingClientRect(),
    zoom,
  );
  trigger.dispatchEvent(
    new view.MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      view,
      button: 2,
      clientX: point.x,
      clientY: point.y,
    }),
  );
}
