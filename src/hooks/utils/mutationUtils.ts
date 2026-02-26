/**
 * Shared mutation utilities for React Query hooks.
 *
 * Provides standardized error/success handling so every mutation across
 * the app behaves consistently — same toast style, same error extraction,
 * same cache-invalidation pattern.
 *
 * @example
 * ```ts
 * import { getErrorMessage, onMutationError, onMutationSuccess } from "@/hooks/utils/mutationUtils";
 *
 * useMutation({
 *   mutationFn: (id: string) => service.delete(id),
 *   onSuccess: onMutationSuccess("Item deleted successfully!"),
 *   onError: onMutationError("Failed to delete item"),
 * });
 * ```
 */

import { showErrorToast, showSuccessToast } from "@/utils/errors/errorToast";

// ---------------------------------------------------------------------------
// Error message extraction
// ---------------------------------------------------------------------------

/**
 * Safely extract a human-readable message from an unknown error value.
 *
 * Handles `Error` instances, plain strings, and arbitrary objects that may
 * carry a `.message` property. Falls back to the provided `fallback` string
 * when the error shape is unrecognisable.
 *
 * @param error    - The caught error (could be anything at runtime).
 * @param fallback - A user-friendly default message.
 * @returns A string suitable for display in a toast or UI.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  ) {
    return (error as Record<string, unknown>).message as string;
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Standardised onError / onSuccess handlers
// ---------------------------------------------------------------------------

/**
 * Options accepted by {@link onMutationError}.
 */
export interface MutationErrorOptions {
  /**
   * When `true` the error is also logged to `console.error`.
   * Useful during development or for mutations where silent failure is risky.
   * @default false
   */
  log?: boolean;

  /** Override the default toast duration (ms). */
  duration?: number;
}

/**
 * Returns a standard `onError` callback for `useMutation`.
 *
 * The callback shows an error toast with a consistent format and optionally
 * logs the raw error for debugging.
 *
 * @param fallbackMessage - Shown when the error doesn't carry a `.message`.
 * @param options         - Additional behaviour tweaks.
 *
 * @example
 * ```ts
 * useMutation({
 *   mutationFn: someService.delete,
 *   onError: onMutationError("Failed to delete item"),
 * });
 * ```
 */
export function onMutationError(
  fallbackMessage: string,
  options: MutationErrorOptions = {},
): (error: unknown) => void {
  const { log = false, duration } = options;

  return (error: unknown) => {
    const message = getErrorMessage(error, fallbackMessage);
    showErrorToast(message, { duration });

    if (log) {
      // eslint-disable-next-line no-console
      console.error(`[Mutation Error] ${fallbackMessage}:`, error);
    }
  };
}

/**
 * Options accepted by {@link onMutationSuccess}.
 */
export interface MutationSuccessOptions {
  /** Override the default toast duration (ms). */
  duration?: number;
}

/**
 * Returns a standard `onSuccess` callback for `useMutation`.
 *
 * Shows a success toast with the given message.
 *
 * @param message - The success message displayed in the toast.
 * @param options - Additional behaviour tweaks.
 *
 * @example
 * ```ts
 * useMutation({
 *   mutationFn: someService.create,
 *   onSuccess: onMutationSuccess("Item created successfully!"),
 * });
 * ```
 */
export function onMutationSuccess(
  message: string,
  options: MutationSuccessOptions = {},
): () => void {
  const { duration } = options;

  return () => {
    showSuccessToast(message, { duration });
  };
}

/**
 * A convenience tuple creator that returns both `onSuccess` and `onError`
 * callbacks ready to spread into a `useMutation` options object.
 *
 * @param successMessage  - Toast message on success.
 * @param errorFallback   - Toast message when the error has no `.message`.
 *
 * @example
 * ```ts
 * const handlers = createMutationHandlers(
 *   "Template created!",
 *   "Failed to create template",
 * );
 *
 * useMutation({
 *   mutationFn: service.create,
 *   ...handlers,
 * });
 * ```
 */
export function createMutationHandlers(
  successMessage: string,
  errorFallback: string,
  options: MutationErrorOptions & MutationSuccessOptions = {},
): {
  onSuccess: () => void;
  onError: (error: unknown) => void;
} {
  return {
    onSuccess: onMutationSuccess(successMessage, options),
    onError: onMutationError(errorFallback, options),
  };
}
