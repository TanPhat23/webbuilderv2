// src/features/interactions/components/InteractionCard.tsx
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KEY_EVENTS, ON_EVENTS, type Interaction, type OnEvent, type Step } from "../schema";
import { StepList, type StepListShared } from "./StepList";

export const EVENT_LABELS: Record<OnEvent, string> = {
  click: "Clicked", dblclick: "Double-clicked", mousedown: "Mouse pressed", mouseup: "Mouse released",
  mouseenter: "Hovered", mouseleave: "Hover ends",
  focus: "Focused", blur: "Loses focus", change: "Changed", input: "Typed into",
  submit: "Submitted", keydown: "Key pressed", keyup: "Key released", load: "Page loads",
  error: "Fails to load", visible: "Scrolled into view",
};

interface Props {
  ixId: string;
  ix: Interaction;
  onChange(patch: Partial<Interaction>): void;
  onRemove(): void;
  shared: Omit<StepListShared, "ixId" | "root" | "onRootChange">;
}

export function InteractionCard({ ixId, ix, onChange, onRemove, shared }: Props) {
  const steps = Array.isArray(ix.do) ? ix.do : [];
  return (
    <section aria-label={`When ${EVENT_LABELS[ix.on] ?? ix.on}`} className="flex flex-col gap-2 rounded-md border border-border p-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground">When</span>
        <Select
          value={ix.on}
          onValueChange={(v) =>
            // key and once belong to specific events: drop them when they no longer apply.
            onChange({
              on: v as OnEvent,
              ...(KEY_EVENTS.has(v) ? {} : { key: undefined }),
              ...(v === "visible" ? {} : { once: undefined }),
            })
          }
        >
          <SelectTrigger aria-label="Event" className="h-7 min-w-0 flex-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectGroup>{ON_EVENTS.map((e) => <SelectItem key={e} value={e} className="text-[11px]">{EVENT_LABELS[e]}</SelectItem>)}</SelectGroup>
          </SelectContent>
        </Select>
        <Switch aria-label="Enabled" checked={ix.enabled !== false} onCheckedChange={(c) => onChange({ enabled: c ? undefined : false })} />
        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Delete interaction" onClick={onRemove}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      {KEY_EVENTS.has(ix.on) && (
        <div className="flex items-center gap-1.5">
          <Label htmlFor={`${ixId}.key`} className="text-[11px] text-muted-foreground">Only key</Label>
          <Input
            id={`${ixId}.key`}
            className="h-7 flex-1 font-mono"
            placeholder="Any key (e.g. Enter, Escape, a)"
            value={ix.key ?? ""}
            onChange={(e) => onChange({ key: e.target.value || undefined })}
          />
        </div>
      )}
      {ix.on === "visible" && (
        <div className="flex items-center justify-between gap-1.5">
          <Label htmlFor={`${ixId}.once`} className="text-[11px] text-muted-foreground">Only the first time</Label>
          <Switch id={`${ixId}.once`} checked={ix.once !== false} onCheckedChange={(c) => onChange({ once: c ? undefined : false })} />
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={`${ixId}.preventDefault`} className="text-[11px] text-muted-foreground">Prevent default</Label>
        <Switch id={`${ixId}.preventDefault`} checked={ix.preventDefault ?? ix.on === "submit"} onCheckedChange={(c) => onChange({ preventDefault: c })} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={`${ixId}.stopPropagation`} className="text-[11px] text-muted-foreground">Stop propagation</Label>
        <Switch id={`${ixId}.stopPropagation`} checked={ix.stopPropagation === true} onCheckedChange={(c) => onChange({ stopPropagation: c })} />
      </div>
      <StepList
        listPath={[]}
        steps={steps}
        shared={{ ...shared, ixId, root: steps, onRootChange: (next: Step[]) => onChange({ do: next }) }}
      />
    </section>
  );
}
