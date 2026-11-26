import { authStateFn } from "@/features/auth/lib/api";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async () => await authStateFn(),
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return <Outlet />;
}
