import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <main className="w-full h-screen flex items-center justify-center">
      <Outlet />
    </main>
  );
}