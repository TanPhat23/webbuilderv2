// src/features/interactions/components/VerbMenu.tsx
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import type { Verb } from "../schema";
import { VERB_LABELS } from "../editing/fields";

export function VerbMenu({ verbs, onPick, label = "Add step" }: { verbs: Verb[]; onPick(verb: Verb): void; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11px] text-muted-foreground">
          <Plus className="h-3 w-3" /> {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search actions…" className="text-[11px]" />
          <CommandList>
            <CommandEmpty>No action found.</CommandEmpty>
            <CommandGroup>
              {verbs.map((v) => (
                <CommandItem key={v} value={`${v} ${VERB_LABELS[v]}`} className="text-[11px]" onSelect={() => { onPick(v); setOpen(false); }}>
                  {VERB_LABELS[v]}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
