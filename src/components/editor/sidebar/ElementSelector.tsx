import { useMemo } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import elementHolders from "@/constants/elements";
import ComponentHolder, { CustomComponentHolder } from "./ComponentHolder";
import { customComps } from "@/lib/customcomponents/customComponents";
import type { ElementTemplate } from "@/types/global.type";

type SortedCustomComponent = {
  component: ElementTemplate;
  index: number;
  label: string;
};

export function ElementSelector() {
  const defaultComponents = useMemo(
    () =>
      [...elementHolders].sort((a, b) =>
        a.type.localeCompare(b.type, undefined, { sensitivity: "base" }),
      ),
    [],
  );

  const customComponents = useMemo<SortedCustomComponent[]>(() => {
    return customComps
      .map((component, index) => {
        const label =
          component.name ||
          component.content ||
          `Custom component ${index + 1}`;
        return { component, index, label };
      })
      .sort((left, right) =>
        left.label.localeCompare(right.label, undefined, {
          sensitivity: "base",
        }),
      );
  }, []);

  return (
    <Command className="w-full overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-lg shadow-black/5">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-border/70 bg-popover/90 backdrop-blur supports-[backdrop-filter]:bg-popover/75">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-wide">
              Insert components
            </div>
            <div className="mt-0.5 text-[11px] leading-none text-muted-foreground">
              Search, then drag into the canvas
            </div>
          </div>

          <div className="shrink-0 rounded-full border border-border/70 bg-muted/30 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Drag
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <CommandInput
            placeholder="Search default or custom…"
            className="h-10 rounded-xl border border-border/70 bg-background/60 px-3 text-sm shadow-sm shadow-black/5 placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>
      </div>

      {/* List */}
      <CommandList className="max-h-[70vh] px-2 py-2">
        <CommandGroup heading="Default components">
          <div className="grid gap-2 py-2">
            {defaultComponents.map((element) => (
              <CommandItem
                key={element.type}
                value={element.type}
                className="group rounded-xl border border-transparent bg-background/40 px-2 py-2 shadow-sm shadow-black/0 transition-colors hover:border-border/80 hover:bg-accent/35 hover:text-accent-foreground hover:shadow-black/5 focus:border-border/80 focus:bg-accent/35 focus:text-accent-foreground aria-selected:border-border/80 aria-selected:bg-accent/35"
              >
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="min-w-0">
                    <ComponentHolder icon={element.icon} type={element.type} />
                  </div>

                  <CommandShortcut className="rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:bg-muted/45 group-hover:text-foreground/70 group-aria-selected:bg-muted/45 group-aria-selected:text-foreground/70">
                    Drag
                  </CommandShortcut>
                </div>
              </CommandItem>
            ))}
          </div>
        </CommandGroup>

        <CommandSeparator className="my-2 opacity-60" />

        <CommandGroup heading="Custom components">
          <div className="grid gap-2 py-2">
            {customComponents.map(({ index, label }) => (
              <CommandItem
                key={`${label}-${index}`}
                value={label}
                className="group rounded-xl border border-transparent bg-background/40 px-2 py-2 shadow-sm shadow-black/0 transition-colors hover:border-border/80 hover:bg-accent/35 hover:text-accent-foreground hover:shadow-black/5 focus:border-border/80 focus:bg-accent/35 focus:text-accent-foreground aria-selected:border-border/80 aria-selected:bg-accent/35"
              >
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="min-w-0">
                    <CustomComponentHolder name={label} index={index} />
                  </div>

                  <CommandShortcut className="rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:bg-muted/45 group-hover:text-foreground/70 group-aria-selected:bg-muted/45 group-aria-selected:text-foreground/70">
                    Drag
                  </CommandShortcut>
                </div>
              </CommandItem>
            ))}
          </div>
        </CommandGroup>

        <CommandEmpty className="py-10">
          <div className="mx-auto flex max-w-[22rem] flex-col items-center gap-2 text-center">
            <div className="text-sm font-medium">No matches</div>
            <p className="text-sm text-muted-foreground">
              Try a different keyword or check your custom components.
            </p>
          </div>
        </CommandEmpty>
      </CommandList>
    </Command>
  );
}
