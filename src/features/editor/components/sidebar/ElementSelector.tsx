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
import elementHolders, { type ElementType } from "@/features/editor/constants/elements";
import { ELEMENT_CATEGORIES } from "@/features/editor/constants/elementCategories";
import ComponentHolder, { CustomComponentHolder } from "./ComponentHolder";
import { customComps } from "@/features/editor/lib/customcomponents/customComponents";
import type { ElementTemplate } from "@/types/global.type";

type SortedCustomComponent = {
  component: ElementTemplate;
  index: number;
  label: string;
};

interface CategorizedElements {
  id: string;
  label: string;
  elements: typeof elementHolders;
}

export function ElementSelector() {
  const elementMap = useMemo(() => {
    return new Map<ElementType, (typeof elementHolders)[number]>(
      elementHolders.map((el) => [el.type, el]),
    );
  }, []);

  const categorizedGroups = useMemo<CategorizedElements[]>(() => {
    return ELEMENT_CATEGORIES.map((cat) => {
      const items = cat.elements
        .map((type) => elementMap.get(type))
        .filter((item): item is (typeof elementHolders)[number] => Boolean(item));
      return {
        id: cat.id,
        label: cat.label,
        elements: items,
      };
    }).filter((group) => group.elements.length > 0);
  }, [elementMap]);

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
    <Command className="flex h-full w-full flex-col border-none bg-transparent shadow-none [&_[data-slot=command-input-wrapper]]:border-none [&_[data-slot=command-input-wrapper]]:bg-muted/40 [&_[data-slot=command-input-wrapper]]:mx-2.5 [&_[data-slot=command-input-wrapper]]:mt-2.5 [&_[data-slot=command-input-wrapper]]:h-8 [&_[data-slot=command-input-wrapper]]:rounded-lg [&_[data-slot=command-input-wrapper]]:transition-colors [&_[data-slot=command-input-wrapper]]:focus-within:bg-muted/60">
      <div className="shrink-0 pb-2">
        <CommandInput placeholder="Search elements…" className="h-8 text-xs" />
      </div>

      <CommandList className="min-h-0 flex-1 px-2.5 pb-4 scrollbar-none max-h-none overflow-y-auto">
        <CommandEmpty className="py-12 text-center text-xs text-muted-foreground">
          No matches found.
        </CommandEmpty>

        {categorizedGroups.map((group, groupIdx) => (
          <div key={group.id} className="mb-3">
            <div className="flex items-center justify-between px-1 py-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </span>
              <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                {group.elements.length}
              </span>
            </div>
            <CommandGroup
              heading={group.label}
              className="p-0 [&_[cmdk-group-heading]]:sr-only"
            >
              <div className="grid grid-cols-2 gap-1.5">
                {group.elements.map((element) => (
                  <CommandItem
                    key={element.type}
                    value={`${element.label} ${element.type} ${group.label}`}
                    className="p-0 rounded-lg transition-all border-none bg-transparent hover:bg-transparent data-[selected=true]:bg-transparent cursor-pointer"
                  >
                    <ComponentHolder
                      icon={element.icon}
                      type={element.type}
                      label={element.label}
                      variant="card"
                    />
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>
            {groupIdx < categorizedGroups.length - 1 && (
              <CommandSeparator className="my-2 opacity-40" />
            )}
          </div>
        ))}

        {customComponents.length > 0 && (
          <div className="mt-2 mb-3">
            <CommandSeparator className="my-2.5 opacity-20" />
            <div className="flex items-center justify-between px-1 py-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Custom components
              </span>
              <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                {customComponents.length}
              </span>
            </div>
            <CommandGroup
              heading="Custom"
              className="p-0 [&_[cmdk-group-heading]]:sr-only"
            >
              <div className="grid grid-cols-2 gap-1.5">
                {customComponents.map(({ index, label }) => (
                  <CommandItem
                    key={`${label}-${index}`}
                    value={`${label} custom`}
                    className="p-0 rounded-lg transition-all border-none bg-transparent hover:bg-transparent data-[selected=true]:bg-transparent cursor-pointer"
                  >
                    <CustomComponentHolder
                      name={label}
                      index={index}
                      variant="card"
                    />
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>
          </div>
        )}
      </CommandList>
    </Command>
  );
}
