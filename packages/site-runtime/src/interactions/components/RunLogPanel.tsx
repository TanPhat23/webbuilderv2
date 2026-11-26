import React, { useState } from "react";
import { ListTree, Trash2, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { useRunLogStore } from "../runtime/run-log-store";

const STATUS_CLASS = {
  ok: "text-emerald-600 dark:text-emerald-400",
  skipped: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
} as const;

/** Floating log of what interactions did, newest first. */
export default function RunLogPanel(): React.JSX.Element {
  const entries = useRunLogStore((s) => s.entries);
  const clear = useRunLogStore((s) => s.clear);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        className="fixed bottom-4 right-4 z-[60] inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-900 shadow-md transition-colors hover:bg-zinc-100"
        onClick={() => setOpen(true)}
      >
        <ListTree className="size-3.5" />
        Run log{entries.length ? ` (${entries.length})` : ""}
      </button>
    );
  }

  return (
    <section
      aria-label="Interaction run log"
      className="fixed bottom-4 right-4 z-[60] flex max-h-[45vh] w-[360px] flex-col rounded-md border border-zinc-200 bg-white text-xs text-zinc-900 shadow-lg"
    >
      <header className="flex h-8 shrink-0 items-center gap-1 border-b border-zinc-200 px-2">
        <ListTree className="size-3.5" />
        <span className="flex-1 font-semibold">Run log</span>
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-zinc-100"
          aria-label="Clear run log"
          onClick={clear}
        >
          <Trash2 className="size-3.5" />
        </button>
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-zinc-100"
          aria-label="Collapse run log"
          onClick={() => setOpen(false)}
        >
          <ChevronDown className="size-3.5" />
        </button>
      </header>
      <ol className="min-h-0 flex-1 overflow-y-auto font-mono text-[11px]">
        {entries.length === 0 && (
          <li className="p-3 font-sans text-zinc-500">
            Nothing yet. Interact with the page to see each step here.
          </li>
        )}
        {[...entries].reverse().map((entry, i) => (
          <li
            key={`${entry.at}-${i}`}
            className="border-b border-zinc-200/70 px-2 py-1"
          >
            <span
              className={cn("mr-1.5 font-semibold", STATUS_CLASS[entry.status])}
            >
              {entry.status}
            </span>
            <span>
              {entry.event} · {entry.verb}
            </span>
            <span className="ml-1.5 text-zinc-500">{entry.path}</span>
            <span className="ml-1.5 text-zinc-500">
              {entry.elementId} / {entry.ixId}
            </span>
            {entry.detail && (
              <div className="pl-1 text-zinc-500">{entry.detail}</div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
