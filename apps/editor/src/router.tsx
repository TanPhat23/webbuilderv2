import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { getQueryClient } from "@/client/queryclient";

export function getRouter() {
  return createRouter({
    routeTree,
    context: { queryClient: getQueryClient() },
    scrollRestoration: true,
  });
}
