import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import RootProviders from "@/providers/rootprovider";
import { Toaster } from "@/components/ui/sonner";
import appCss from "./globals.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "WebBuilder" },
      { name: "description", content: "WebBuilder - Visual website builder" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <RootProviders>
          <Outlet />
        </RootProviders>
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}