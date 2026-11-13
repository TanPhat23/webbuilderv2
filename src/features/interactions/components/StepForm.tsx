// src/features/interactions/components/StepForm.tsx
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { verbOf, type Issue, type Step } from "../schema";
import { FIELDS, formatHeaders, parseHeaders, type FieldDef } from "../editing/fields";
import type { SuggestContext } from "../editing/suggest";
import { ExpressionInput } from "./ExpressionInput";
import { ElementRefInput } from "./ElementRefInput";

interface Props {
  step: Step;
  onChange(step: Step): void;
  issues: Issue[];           // issues for this step only (path === stepPath or startsWith stepPath + ".")
  stepPath: string;
  suggestCtx: SuggestContext;
  variables: string[];
  flows: string[];
}

export function StepForm({ step, onChange, issues, stepPath, suggestCtx, variables, flows }: Props) {
  const verb = verbOf(step);
  if (!verb) return <p className="text-[11px] text-destructive">This step is not valid.</p>;
  const s = step as Record<string, unknown>;
  const set = (key: string, v: unknown) => {
    const next = { ...s };
    if (key === "id" && !v) {
      delete next.id;
      onChange(next as Step);
      return;
    }
    if (v === undefined || v === "") {
      const def = FIELDS[verb].find((f) => f.key === key);
      if (def?.optional) delete next[key];
      else next[key] = v ?? "";
    } else next[key] = v;
    onChange(next as Step);
  };
  const issueFor = (key: string) => issues.find((i) => i.path === `${stepPath}.${key}` || i.path.startsWith(`${stepPath}.${key}.`));

  const field = (f: FieldDef) => {
    const id = `${stepPath}.${f.key}`;
    const value = s[f.key];
    const issue = issueFor(f.key);
    const label = `${f.label}${f.optional ? " (optional)" : ""}`;
    let control: React.ReactNode;
    switch (f.kind) {
      case "expr":
        control = <ExpressionInput id={id} aria-label={f.label} value={String(value ?? "")} onChange={(v) => set(f.key, v)} ctx={suggestCtx} placeholder={f.placeholder} multiline={f.key === "body"} invalid={issue?.level !== "warning" && !!issue} />;
        break;
      case "element":
        control = <ElementRefInput aria-label={f.label} value={typeof value === "string" || typeof value === "number" ? value : ""} onChange={(v) => set(f.key, v)} elements={suggestCtx.elements} ctx={suggestCtx} allowNumber={verb === "scroll" && f.key === "scroll"} />;
        break;
      case "number":
        control = <Input id={id} type="number" value={value === undefined ? "" : String(value)} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value === "" ? undefined : Number(e.target.value))} />;
        break;
      case "boolean":
        control = <Switch id={id} checked={value === undefined ? f.key === "smooth" : value === true} onCheckedChange={(c) => set(f.key, c)} />;
        break;
      case "select":
      case "variable":
      case "flow": {
        const options = f.kind === "variable" ? variables : f.kind === "flow" ? flows : (f.options ?? []);
        control = (
          <Select value={typeof value === "string" ? value : ""} onValueChange={(v) => set(f.key, v)}>
            <SelectTrigger id={id} aria-label={f.label}><SelectValue placeholder="Choose" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>{options.map((o) => <SelectItem key={o} value={o} className="text-[11px]">{o}</SelectItem>)}</SelectGroup>
            </SelectContent>
          </Select>
        );
        break;
      }
      case "headers":
        control = <HeadersInput id={id} value={(value as Record<string, string>) ?? {}} onChange={(rec) => set(f.key, Object.keys(rec).length ? rec : undefined)} />;
        break;
      case "code":
        control = <Textarea id={id} rows={4} className="font-mono" value={String(value ?? "")} onChange={(e) => set(f.key, e.target.value)} />;
        break;
      default:
        control = <Input id={id} value={String(value ?? "")} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />;
    }
    return (
      <div key={f.key} className={f.kind === "boolean" ? "flex items-center justify-between gap-2" : "flex flex-col gap-1"}>
        <Label htmlFor={id} className="text-[11px] text-muted-foreground">{label}</Label>
        {control}
        {issue && (
          <p className={issue.level === "warning" ? "text-[10px] text-amber-600" : "text-[10px] text-destructive"}>
            {issue.message}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2 pt-2">
      {FIELDS[verb].map(field)}
      <div className="flex flex-col gap-1">
        <Label htmlFor={`${stepPath}.id`} className="text-[11px] text-muted-foreground">Result name (optional)</Label>
        <Input id={`${stepPath}.id`} className="font-mono" placeholder="e.g. signup" value={typeof s.id === "string" ? s.id : ""} onChange={(e) => set("id", e.target.value || undefined)} />
      </div>
    </div>
  );
}

function HeadersInput({ id, value, onChange }: { id: string; value: Record<string, string>; onChange(value: Record<string, string>): void }) {
  const formatted = formatHeaders(value);
  const [draft, setDraft] = useState(formatted);
  const [focused, setFocused] = useState(false);
  useEffect(() => { if (!focused) setDraft(formatted); }, [formatted, focused]);
  return <Textarea id={id} rows={2} className="font-mono" placeholder="Authorization: Bearer {{ vars.token }}" value={draft}
    onFocus={() => setFocused(true)} onBlur={() => { setFocused(false); onChange(parseHeaders(draft)); }}
    onChange={(e) => { setDraft(e.target.value); onChange(parseHeaders(e.target.value)); }} />;
}
