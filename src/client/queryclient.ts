import {
  isServer,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { isApiError, isRetryable } from "@/services/api-error";
import { showErrorToast } from "@/utils/errors/errorToast";

const MAX_RETRIES = 2;

/** Retry only what could succeed if sent again: network faults and 5xx. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  return failureCount < MAX_RETRIES && isRetryable(error);
}

/**
 * Failures every screen would otherwise have to report on its own. Queries
 * are reported only when the whole session is affected (expired sign-in,
 * lost connection), under a fixed toast id so a burst of failing queries
 * shows one toast. Mutations are reported unless they supply their own
 * `onError`.
 */
function reportQueryError(error: unknown): void {
  if (isServer || !isApiError(error)) return;
  if (error.kind === "unauthorized") {
    toast.error(error.message, { id: "session-expired", duration: 8000 });
  } else if (error.kind === "network") {
    toast.error(error.message, { id: "network-offline", duration: 5000 });
  }
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: reportQueryError }),
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) => {
        if (isServer || mutation.options.onError) return;
        showErrorToast(error);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        retry: shouldRetry,
      },
      mutations: { retry: false },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
