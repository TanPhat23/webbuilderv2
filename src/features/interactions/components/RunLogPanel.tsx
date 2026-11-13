import { useState } from "react";
import { ListTree, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRunLogStore } from "../runtime/run-log-store";

const STATUS_CLASS = {
  ok: "text-emerald-600 dark:text-emerald-400",
  skipped: "text-amber-600 dark:text-amber-400",
  error: "text-destructive",
} as const;

/** Floating log of what interactions did, newest first. */
export default function RunLogPanel() {
  const entries = useRunLogStore((s) => s.entries);
  const clear = useRunLogStore((s) => s.clear);
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <Button
        size="sm"
        variant="secondary"
        className="fixed bottom-4 right-4 z-[60] h-8 gap-1.5 text-xs shadow-md"
        onClick={() => setOpen(true)}
      >
        <ListTree />
        Run log{entries.length ? ` (${entries.length})` : ""}
      </Button>
    );
  return (
    <section
      aria-label="Interaction run log"
      className="fixed bottom-4 right-4 z-[60] flex max-h-[45vh] w-[360px] flex-col rounded-md border border-border bg-card text-xs shadow-lg"
    >
      <header className="flex h-8 shrink-0 items-center gap-1 border-b border-border px-2">
        <ListTree />
        <span className="flex-1 font-semibold">Run log</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          aria-label="Clear run log"
          onClick={clear}
        >
          <Trash2 />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          aria-label="Collapse run log"
          onClick={() => setOpen(false)}
        >
          <ChevronDown />
        </Button>
      </header>
      <ol className="min-h-0 flex-1 overflow-y-auto font-mono text-[11px]">
        {entries.length === 0 && (
          <li className="p-3 font-sans text-muted-foreground">
            Nothing yet. Interact with the page to see each step here.
          </li>
        )}
        {[...entries].reverse().map((entry, i) => (
          <li
            key={`${entry.at}-${i}`}
            className="border-b border-border/60 px-2 py-1"
          >
            <span
              className={cn("mr-1.5 font-semibold", STATUS_CLASS[entry.status])}
            >
              {entry.status}
            </span>
            <span>
              {(entry as typeof entry & { event?: string }).event} ·{" "}
              {entry.verb}
            </span>
            <span className="ml-1.5 text-muted-foreground">{entry.path}</span>
            <span className="ml-1.5 text-muted-foreground">
              {entry.elementId} / {entry.ixId}
            </span>
            {entry.detail && (
              <div className="pl-1 text-muted-foreground">{entry.detail}</div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
