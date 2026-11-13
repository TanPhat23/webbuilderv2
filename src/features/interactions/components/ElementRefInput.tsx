import { useEffect } from "react";
import { Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePickStore } from "../editing/pick-store";
import type { SuggestContext } from "../editing/suggest";
import { ExpressionInput } from "./ExpressionInput";

interface Props {
  value: string | number;
  onChange(value: string | number): void;
  elements: { id: string; name: string }[];
  ctx: SuggestContext;
  allowNumber?: boolean;
  "aria-label": string;
}

/** Select a page element, pick it on the canvas, or enter an expression. */
export function ElementRefInput({ value, onChange, elements, ctx, allowNumber, ...rest }: Props) {
  const picking = usePickStore((s) => s.onPick !== null);
  const start = usePickStore((s) => s.start);
  const cancel = usePickStore((s) => s.cancel);
  const selected = typeof value === "string" && elements.some((e) => e.id === value) ? value : "";
  const missing = typeof value === "string" && !!value && !value.includes("{{") && !selected;
  useEffect(() => {
    if (!picking) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") cancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picking, cancel]);
  return <div className="flex min-w-0 flex-col gap-1">
    <div className="flex min-w-0 items-center gap-1">
      <Select value={selected} onValueChange={onChange}>
        <SelectTrigger aria-label={rest["aria-label"]} className="min-w-0 flex-1"><SelectValue placeholder={missing ? "Missing element" : "Choose element"} /></SelectTrigger>
        <SelectContent><SelectGroup>{elements.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectGroup></SelectContent>
      </Select>
      <Button type="button" variant={picking ? "default" : "outline"} size="icon" className="shrink-0" aria-label={picking ? "Cancel picking" : "Pick on canvas"} onClick={() => picking ? cancel() : start(onChange)}><Crosshair /></Button>
    </div>
    <ExpressionInput aria-label="Element or expression" value={typeof value === "string" ? value : ""} onChange={onChange} ctx={ctx} placeholder="Element ID or {{ expression }}" />
    {allowNumber && <Input aria-label="Scroll position" type="number" placeholder="Position (px)" value={typeof value === "number" ? value : ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />}
    {missing && <span className="text-xs text-destructive" role="status">Missing element</span>}
  </div>;
}
