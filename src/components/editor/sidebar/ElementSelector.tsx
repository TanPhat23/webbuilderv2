import { useMemo } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import elementHolders from "@/constants/elements";
import ComponentHolder, { CustomComponentHolder } from "./ComponentHolder";
import { customComps } from "@/lib/customcomponents/customComponents";
import type { ElementTemplate } from "@/types/global.type";
import type { IconName } from "@/lib/utils/icons/iconMap";

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
    <Command className="flex h-full w-full flex-col border-none bg-transparent shadow-none [&_[data-slot=command-input-wrapper]]:border-none [&_[data-slot=command-input-wrapper]]:bg-muted/40 [&_[data-slot=command-input-wrapper]]:mx-4 [&_[data-slot=command-input-wrapper]]:mt-4 [&_[data-slot=command-input-wrapper]]:rounded-lg [&_[data-slot=command-input-wrapper]]:transition-colors [&_[data-slot=command-input-wrapper]]:focus-within:bg-muted/60">
      <div className="flex flex-col gap-2">
        <CommandInput placeholder="Search elements..." className="h-9" />
        <div className="px-5 pt-2 pb-1">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
            Components
          </h2>
        </div>
      </div>

      <CommandList className="flex-1 px-3 pb-6 scrollbar-none max-h-none overflow-y-auto">
        <CommandEmpty className="py-12 text-center text-xs text-muted-foreground">
          No matches found.
        </CommandEmpty>

        <CommandGroup
          heading="Standard"
          className="px-1 [&_[cmdk-group-heading]]:sr-only"
        >
          <div className="flex flex-col gap-0.5">
            {defaultComponents.map((element) => (
              <CommandItem
                key={element.type}
                value={element.type}
                className="p-0 h-9 rounded-md transition-all hover:bg-accent/50 data-[selected=true]:bg-accent/70 cursor-pointer"
              >
                <ComponentHolder
                  icon={element.icon as IconName}
                  type={element.type}
                />
              </CommandItem>
            ))}
          </div>
        </CommandGroup>

        {customComponents.length > 0 && (
          <>
            <CommandSeparator className="my-4 mx-2 opacity-10" />
            <div className="px-2 pt-2 pb-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                Custom
              </h3>
            </div>
            <CommandGroup
              heading="Custom"
              className="px-1 [&_[cmdk-group-heading]]:sr-only"
            >
              <div className="flex flex-col gap-0.5">
                {customComponents.map(({ index, label }) => (
                  <CommandItem
                    key={`${label}-${index}`}
                    value={label}
                    className="p-0 h-9 rounded-md transition-all hover:bg-accent/50 data-[selected=true]:bg-accent/70 cursor-pointer"
                  >
                    <CustomComponentHolder name={label} index={index} />
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
}
