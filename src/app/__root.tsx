import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  Link,
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
  notFoundComponent: () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium"
        >
          Go back home
        </Link>
      </div>
    );
  },
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
