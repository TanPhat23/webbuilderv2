import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/marketplace")({
  component: MarketplaceLayout,
});

function MarketplaceLayout() {
  return <Outlet />;
}