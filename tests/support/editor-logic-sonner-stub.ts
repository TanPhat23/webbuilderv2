/** `sonner` with a recording `toast`. */
export const toasts: Array<{ kind: string; message: string; options?: unknown }> = [];
export const toast = {
  error: (message: string, options?: unknown) => void toasts.push({ kind: 'error', message, options }),
  success: (message: string, options?: unknown) => void toasts.push({ kind: 'success', message, options }),
};
