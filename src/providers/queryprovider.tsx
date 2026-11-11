import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@clerk/tanstack-react-start";
import { useLayoutEffect, useRef } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useRouter().options.context.queryClient;
  const { isLoaded, userId } = useAuth();
  const previousUser = useRef<string | null | undefined>(undefined);

  useLayoutEffect(() => {
    if (!isLoaded) return;
    const currentUser = userId ?? null;
    if (previousUser.current !== undefined && previousUser.current !== currentUser) {
      queryClient.clear();
    }
    previousUser.current = currentUser;
  }, [isLoaded, userId, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}