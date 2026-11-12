import React from "react";
import { Minus, Plus } from "lucide-react";

/** A Style-tab section: title row, optional +/− toggle, and the body when on. */
export function Section({
  title,
  optional,
  actions,
  disabled,
  children,
}: {
  title: string;
  optional?: { on: boolean; onAdd: () => void; onRemove: () => void };
  actions?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  const on = optional ? optional.on : true;
  return (
    <section className="border-b border-border/45 px-3 py-3 last:border-b-0">
      <div className="flex h-5 items-center gap-1">
        <h3
          className={
            on
              ? "flex-1 text-xs font-medium text-foreground/90"
              : "flex-1 text-xs font-medium text-muted-foreground"
          }
        >
          {title}
        </h3>
        {on && actions}
        {optional && !disabled && (
          <button
            type="button"
            aria-label={
              on
                ? `Remove ${title.toLowerCase()}`
                : `Add ${title.toLowerCase()}`
            }
            title={
              on
                ? `Remove ${title.toLowerCase()}`
                : `Add ${title.toLowerCase()}`
            }
            onClick={on ? optional.onRemove : optional.onAdd}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {on ? (
              <Minus className="h-3.5 w-3.5" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
      {on && children && (
        <div className="mt-2.5 flex flex-col gap-2">{children}</div>
      )}
    </section>
  );
}
