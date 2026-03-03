import { isServer, QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;
let serverQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    if (!serverQueryClient) serverQueryClient = makeQueryClient();
    return serverQueryClient;
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
