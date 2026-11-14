// src/features/interactions/components/LogicPanel.tsx
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronRight, Plus, Redo2, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/types/global.type";
import { useElements } from "@/features/editor";
import { NAME_RE, validateInteractionMap, type Issue, type Step } from "../schema";
import { referenceWarnings } from "../references";
import { getInteractions } from "../ops";
import { menuVerbs } from "../editing/fields";
import { defaultFor, formatDefault, parseDefault, VARIABLE_TYPES } from "../editing/logic-edit";
import { findUsageLocations, useLogicStore, type LogicScope } from "../logic-store";
import { useActiveLogic } from "../logic-hooks";
import type { LogicDocument } from "../logic";
import type { VariableDef } from "../runtime/variables";
import { StepList } from "./StepList";

const FLOW_KEY = "ix_aaaaaaaa";
const LIFETIMES: Record<string, string> = { page: "Resets on load", session: "This tab", local: "This browser" };
const RESERVED = new Set(["__proto__", "constructor", "prototype"]);

function walkElements(tree: EditorElement[], out: EditorElement[] = []) {
  for (const el of tree) {
    out.push(el);
    const kids = (el as unknown as { elements?: EditorElement[] }).elements;
    if (Array.isArray(kids)) walkElements(kids, out);
  }
  return out;
}

type Entry<T> = { scope: LogicScope; label: string; name: string; value: T };

export default function LogicPanel() {
  const { pageId, projectId } = useActiveLogic();
  const project = useLogicStore((s) => s.project);
  const pages = useLogicStore((s) => s.pages);
  const { edit, undo, redo } = useLogicStore.getState();
  const canUndo = useLogicStore((s) => s.past.length > 0);
  const canRedo = useLogicStore((s) => s.future.length > 0);
  const tree = useElements();
  const elements = useMemo(() => walkElements(tree), [tree]);
  const [pendingRemoval, setPendingRemoval] = useState<{ kind: "variable" | "flow"; entry: Entry<unknown> } | null>(null);

  const pageScope: LogicScope | null = pageId ? { page: pageId } : null;
  const docs: { scope: LogicScope; label: string; doc: LogicDocument }[] = [
    { scope: "project", label: "Project", doc: project },
    ...(pageId ? [{ scope: { page: pageId } as LogicScope, label: "This page", doc: pages[pageId] ?? { v: 1 as const, variables: {}, flows: {} } }] : []),
  ];
  const variables: Entry<VariableDef>[] = docs.flatMap((d) => Object.entries(d.doc.variables).map(([name, value]) => ({ scope: d.scope, label: d.label, name, value })));
  const flows: Entry<{ do: Step[] }>[] = docs.flatMap((d) => Object.entries(d.doc.flows).map(([name, value]) => ({ scope: d.scope, label: d.label, name, value })));
  const visibleNames = useMemo(() => ({ variables: variables.map((v) => v.name), flows: flows.map((f) => f.name) }), [variables, flows]);

  const report = (r: { ok: boolean; issues?: Issue[] }) => {
    if (!r.ok) toast.error(r.issues?.[0]?.message ?? "That change isn't valid");
    return r.ok;
  };
  const change = (scope: LogicScope, fn: (d: LogicDocument) => LogicDocument, opts?: { allowIncomplete?: boolean }) =>
    report(edit(scope, (d) => ({ ok: true, logic: fn(d) }), opts));

  const usageSources = [
    ...elements.map((el) => ({ label: `Element: ${el.name || `${el.type} ${el.id.slice(0, 4)}`}`, value: getInteractions(el) })),
    ...Object.entries(pages).flatMap(([id, p]) => Object.entries(p.flows).filter(([name]) => !(pendingRemoval?.kind === "flow" && pendingRemoval.entry.name === name && typeof pendingRemoval.entry.scope !== "string" && pendingRemoval.entry.scope.page === id)).map(([name, value]) => ({ label: `${id === pageId ? "This page" : `Page ${id}`} flow: ${name}`, value }))),
    ...Object.entries(project.flows).filter(([name]) => !(pendingRemoval?.kind === "flow" && pendingRemoval.entry.name === name && pendingRemoval.entry.scope === "project")).map(([name, value]) => ({ label: `Project flow: ${name}`, value })),
  ];
  const usages = pendingRemoval ? findUsageLocations(pendingRemoval.kind, pendingRemoval.entry.name, usageSources) : [];

  const remove = (kind: "variable" | "flow", entry: Entry<unknown>) => {
    // Steps that still point at it keep their text; they just warn until fixed.
    const key = kind === "variable" ? "variables" : "flows";
    change(entry.scope, (d) => {
      const { [entry.name]: _gone, ...rest } = d[key];
      return { ...d, [key]: rest };
    }, { allowIncomplete: true });
  };

  if (!projectId) return <p className="p-3 text-[11px] text-muted-foreground">Open a project to edit its logic.</p>;

  return (
    <div className="flex flex-col gap-4 p-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] leading-snug text-muted-foreground">Variables hold values; flows are reusable steps. Both work in any interaction.</p>
        <div className="flex shrink-0">
          <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Undo logic change" disabled={!canUndo} onClick={() => { const r = undo(); if (r) report(r); }}><Undo2 className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Redo logic change" disabled={!canRedo} onClick={() => { const r = redo(); if (r) report(r); }}><Redo2 className="h-3 w-3" /></Button>
        </div>
      </div>

      <section aria-label="Variables" className="flex flex-col gap-2">
        <h3 className="text-[10px] font-semibold uppercase text-muted-foreground">Variables</h3>
        {variables.length === 0 && <p className="text-[11px] text-muted-foreground">No variables yet.</p>}
        {variables.map((v) => (
          <VariableRow
            key={`${v.label}:${v.name}`}
            entry={v}
            onChange={(def) => change(v.scope, (d) => ({ ...d, variables: { ...d.variables, [v.name]: def } }))}
            onRemove={() => setPendingRemoval({ kind: "variable", entry: v })}
          />
        ))}
        <AddForm
          kind="variable"
          pageScope={pageScope}
          taken={[...visibleNames.variables, ...Object.keys(pages).flatMap((id) => Object.keys(pages[id].variables)), ...Object.keys(project.variables)]}
          onAdd={(scope, name) => change(scope, (d) => ({ ...d, variables: { ...d.variables, [name]: { type: "string", default: "" } } }))}
        />
      </section>

      <section aria-label="Flows" className="flex flex-col gap-2">
        <h3 className="text-[10px] font-semibold uppercase text-muted-foreground">Flows</h3>
        {flows.length === 0 && <p className="text-[11px] text-muted-foreground">No flows yet.</p>}
        {flows.map((f) => (
          <FlowRow
            key={`${f.label}:${f.name}`}
            entry={f}
            elements={elements.map((el) => ({ id: el.id, name: el.name || `${el.type} ${el.id.slice(0, 4)}` }))}
            variables={visibleNames.variables}
            flows={visibleNames.flows}
            onSteps={(steps) => change(f.scope, (d) => ({ ...d, flows: { ...d.flows, [f.name]: { do: steps } } }), { allowIncomplete: true })}
            onRemove={() => setPendingRemoval({ kind: "flow", entry: f })}
          />
        ))}
        <AddForm
          kind="flow"
          pageScope={pageScope}
          taken={[...Object.keys(pages).flatMap((id) => Object.keys(pages[id].flows)), ...Object.keys(project.flows)]}
          onAdd={(scope, name) => change(scope, (d) => ({ ...d, flows: { ...d.flows, [name]: { do: [] } } }), { allowIncomplete: true })}
        />
      </section>
      <AlertDialog open={pendingRemoval !== null} onOpenChange={(open) => { if (!open) setPendingRemoval(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingRemoval?.kind} {pendingRemoval?.entry.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {usages.length ? "These loaded locations still reference it:" : "No references were found in the loaded locations."} Interactions on other pages may contain additional references.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {usages.length > 0 && <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto text-sm">{usages.map((usage, index) => <li key={`${usage.label}-${index}`}>{usage.label} ({usage.count})</li>)}</ul>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (pendingRemoval) remove(pendingRemoval.kind, pendingRemoval.entry); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AddForm({ kind, pageScope, taken, onAdd }: {
  kind: "variable" | "flow";
  pageScope: LogicScope | null;
  taken: string[];
  onAdd(scope: LogicScope, name: string): boolean;
}) {
  const [name, setName] = useState("");
  const [shared, setShared] = useState(!pageScope);
  const trimmed = name.trim();
  const problem = !trimmed ? null : RESERVED.has(trimmed) || !NAME_RE.test(trimmed) ? "Use letters, numbers and _ , starting with a letter" : taken.includes(trimmed) ? `Another ${kind} already has this name` : null;
  const submit = () => {
    if (!trimmed || problem) return;
    if (onAdd(shared || !pageScope ? "project" : pageScope, trimmed)) setName("");
  };
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <Input
          aria-label={`New ${kind} name`}
          aria-invalid={!!problem}
          className="h-7 flex-1 text-[11px]"
          placeholder={kind === "variable" ? "newVariable" : "newFlow"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px]" disabled={!trimmed || !!problem} onClick={submit}>
          <Plus className="h-3 w-3" /> Add
        </Button>
      </div>
      {pageScope && (
        <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <input type="checkbox" checked={shared} onChange={(e) => setShared(e.target.checked)} /> Available on every page
        </label>
      )}
      {problem && <p role="alert" className="text-[10px] text-destructive">{problem}</p>}
    </div>
  );
}

function VariableRow({ entry, onChange, onRemove }: { entry: Entry<VariableDef>; onChange(def: VariableDef): boolean; onRemove(): void }) {
  const { name, value: def } = entry;
  const stored = formatDefault(def.type, def.default);
  const [text, setText] = useState(stored);
  const [shownFor, setShownFor] = useState(stored);
  if (shownFor !== stored) { setShownFor(stored); setText(stored); }
  const parsed = parseDefault(def.type, text);
  const commitText = () => {
    if (parsed.ok) { if (text !== stored) onChange({ ...def, default: parsed.value }); }
    else setText(stored);
  };
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border p-2">
      <div className="flex items-center gap-1">
        <code className="min-w-0 flex-1 truncate text-[11px] font-medium">{name}</code>
        <span className="rounded bg-muted px-1 text-[10px] text-muted-foreground">{entry.label}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label={`Delete variable ${name}`} onClick={onRemove}><Trash2 className="h-3 w-3" /></Button>
      </div>
      <div className="flex items-center gap-1">
        <Select value={def.type} onValueChange={(t) => onChange({ ...def, type: t as VariableDef["type"], default: defaultFor(t as VariableDef["type"]) })}>
          <SelectTrigger aria-label={`${name} type`} className="h-7 w-[84px] text-[11px]"><SelectValue /></SelectTrigger>
          <SelectContent>{VARIABLE_TYPES.map((t) => <SelectItem key={t} value={t} className="text-[11px]">{t}</SelectItem>)}</SelectContent>
        </Select>
        <Input
          aria-label={`${name} default`}
          aria-invalid={!parsed.ok}
          className={cn("h-7 min-w-0 flex-1 text-[11px]", !parsed.ok && "border-destructive")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commitText}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-muted-foreground">Keep</span>
        <Select value={def.lifetime ?? "page"} onValueChange={(l) => onChange({ ...def, lifetime: l as VariableDef["lifetime"] })}>
          <SelectTrigger aria-label={`${name} lifetime`} className="h-7 flex-1 text-[11px]"><SelectValue /></SelectTrigger>
          <SelectContent>{Object.entries(LIFETIMES).map(([k, label]) => <SelectItem key={k} value={k} className="text-[11px]">{label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {!parsed.ok && <p role="alert" className="text-[10px] text-destructive">{parsed.message}</p>}
    </div>
  );
}

function FlowRow({ entry, elements, variables, flows, onSteps, onRemove }: {
  entry: Entry<{ do: Step[] }>;
  elements: { id: string; name: string }[];
  variables: string[];
  flows: string[];
  onSteps(steps: Step[]): void;
  onRemove(): void;
}) {
  const [open, setOpen] = useState(false);
  const steps = entry.value.do;
  const issues = useMemo(() => {
    const map = { [FLOW_KEY]: { on: "click" as const, do: steps } };
    return [
      ...validateInteractionMap(map),
      ...referenceWarnings(map, { elementIds: new Set(elements.map((e) => e.id)), variables: new Set(variables), flows: new Set(flows) }),
    ];
  }, [steps, elements, variables, flows]);
  return (
    <div className="rounded-md border border-border">
      <div className="flex items-center gap-1 px-1 py-1">
        <button type="button" className="flex min-w-0 flex-1 items-center gap-1 text-left text-[11px]" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <ChevronRight className={cn("h-3 w-3 shrink-0 transition-transform", open && "rotate-90")} />
          <code className="truncate font-medium">{entry.name}</code>
          <span className="text-muted-foreground">{steps.length} step{steps.length === 1 ? "" : "s"}</span>
        </button>
        <span className="rounded bg-muted px-1 text-[10px] text-muted-foreground">{entry.label}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label={`Delete flow ${entry.name}`} onClick={onRemove}><Trash2 className="h-3 w-3" /></Button>
      </div>
      {open && (
        <div className="border-t border-border p-2">
          <StepList
            listPath={[]}
            steps={steps}
            shared={{
              ixId: FLOW_KEY,
              root: steps,
              onRootChange: onSteps,
              issues,
              nameOf: (id) => elements.find((e) => e.id === id)?.name,
              elements,
              variables,
              flows: flows.filter((f) => f !== entry.name),
              verbs: menuVerbs({ variables: variables.length, flows: Math.max(0, flows.length - 1) }),
            }}
          />
        </div>
      )}
    </div>
  );
}
