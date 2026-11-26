import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: SiteRuntimeIndex,
});

function SiteRuntimeIndex() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-semibold text-zinc-900">
        WebBuilder Site Runtime
      </h1>
      <p className="mt-2 max-w-md text-sm text-zinc-500">
        Published sites and isolated draft previews are served from this host.
      </p>
    </main>
  );
}
