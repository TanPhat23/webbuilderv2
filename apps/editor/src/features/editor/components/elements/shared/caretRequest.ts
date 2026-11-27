/** A point in the iframe document's own client coordinates. */
export interface CaretPoint {
  readonly x: number;
  readonly y: number;
}

/** How long a requested caret point stays valid for the editing start it came from. */
const CARET_REQUEST_TTL_MS = 1000;

let caretRequest: {
  readonly elementId: string;
  readonly point: CaretPoint;
  readonly at: number;
} | null = null;

/**
 * Asks the element that is about to enter inline editing to put its caret
 * under `point` (the double-click position) instead of at the end of its text.
 */
export function requestCaretAtPoint(elementId: string, point: CaretPoint): void {
  caretRequest = { elementId, point, at: Date.now() };
}

export function takeCaretRequest(elementId: string): CaretPoint | null {
  const request = caretRequest;
  caretRequest = null;
  if (!request || request.elementId !== elementId) return null;
  return Date.now() - request.at <= CARET_REQUEST_TTL_MS ? request.point : null;
}
