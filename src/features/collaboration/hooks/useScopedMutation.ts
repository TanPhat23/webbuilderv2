import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { createMutationErrorHandler, createMutationSuccessHandler } from "@/hooks/utils/mutationUtils";

export function useScopedMutation<TData, TVariables>({
  mutationFn,
  invalidateKey,
  successMessage,
  errorMessage,
}: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidateKey: QueryKey;
  successMessage: string | ((data: TData, variables: TVariables) => string);
  errorMessage: string;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: invalidateKey });
      const message =
        typeof successMessage === "function"
          ? successMessage(data, variables)
          : successMessage;
      createMutationSuccessHandler(message)();
    },
    onError: createMutationErrorHandler(errorMessage),
  });
}
