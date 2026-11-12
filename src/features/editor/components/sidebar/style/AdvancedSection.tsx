import React, { Suspense, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import TailwindClassesEditor from "./TailwindClassesEditor";

const CssTextareaImporter = React.lazy(
  () => import("../../editor/CssTextareaImporter"),
);

/** Collapsed by default: raw Tailwind classes and the project CSS importer. */
export function AdvancedSection({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="px-3 py-2.5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-5 w-full items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-90",
          )}
        />
        Advanced
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-muted-foreground">
              Tailwind classes
            </span>
            <TailwindClassesEditor disabled={disabled} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-muted-foreground">
              Import CSS (project-wide)
            </span>
            <Suspense fallback={null}>
              <CssTextareaImporter />
            </Suspense>
          </div>
        </div>
      )}
    </section>
  );
}
