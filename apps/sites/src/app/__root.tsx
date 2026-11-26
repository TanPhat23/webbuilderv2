import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import appCss from "./globals.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "WebBuilder Site" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: SiteRootLayout,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-3xl font-semibold text-zinc-900">404</h1>
      <p className="text-sm text-zinc-500">
        The page you are looking for does not exist.
      </p>
    </div>
  ),
});

function SiteRootLayout() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Toaster position="top-right" richColors closeButton />
        <Scripts />
      </body>
    </html>
  );
}
