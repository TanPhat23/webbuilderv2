import { toast } from "sonner";
import { isApiError } from "@/services/api-error";

/** Default duration (ms) for error toasts. */
const DEFAULT_ERROR_DURATION = 4000;

/** Default duration (ms) for success toasts. */
const DEFAULT_SUCCESS_DURATION = 1500;

/**
 * Display a standardized error toast notification.
 *
 * Accepts either a string message or an `Error` instance. When an `Error` is
 * provided the `.message` property is used as the toast body.
 *
 * @param error   - The error message or `Error` object to display.
 * @param options - Optional overrides for the toast (e.g. `duration`).
 *
 * @example
 * ```ts
 * showErrorToast("Cannot add elements - editor is in read-only mode");
 * showErrorToast(new Error("Network failure"), { duration: 5000 });
 * ```
 */
export function showErrorToast(
  error: Error | string,
  options: { duration?: number } = {},
): void {
  const message = typeof error === "string" ? error : error.message;
  // Server faults carry a request id; surfacing it lets support find the log line.
  const reference =
    isApiError(error) && error.kind === "server" && error.requestId
      ? `Reference: ${error.requestId}`
      : undefined;
  toast.error(message, {
    description: reference,
    duration: options.duration ?? DEFAULT_ERROR_DURATION,
  });
}

/**
 * Display a standardized success toast notification.
 *
 * @param message  - The success message to display.
 * @param options  - Optional overrides for the toast (e.g. `duration`).
 *
 * @example
 * ```ts
 * showSuccessToast("Elements swapped successfully");
 * ```
 */
export function showSuccessToast(
  message: string,
  options: { duration?: number } = {},
): void {
  toast.success(message, {
    duration: options.duration ?? DEFAULT_SUCCESS_DURATION,
  });
}

/**
 * Convenience messages for common read-only permission errors.
 *
 * Using constants prevents typos and makes it easy to update copy globally.
 */
export const PERMISSION_ERRORS = {
  cannotAdd: "Cannot add elements - editor is in read-only mode",
  cannotEdit: "Cannot edit elements - editor is in read-only mode",
  cannotDelete: "Cannot delete elements - editor is in read-only mode",
  cannotReorder: "Cannot reorder elements - editor is in read-only mode",
  cannotCut: "Cannot cut elements - editor is in read-only mode",
  cannotPaste: "Cannot paste elements - editor is in read-only mode",
  cannotSave: "Cannot save elements - editor is in read-only mode",
  cannotPerformAction:
    "Cannot perform this action - editor is in read-only mode",
} as const;
