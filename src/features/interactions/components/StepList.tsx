// src/features/interactions/components/StepList.tsx
import { useState } from "react";
import { ChevronRight, GripVertical, Trash2, Copy, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { verbOf, type IfStep, type Issue, type Step } from "../schema";
import {
  defaultStep, insertStep, issuePath, moveStep, removeStep, replaceStep, stepIdsBefore, summarize, type StepPath,
} from "../editing/steps-edit";
import type { SuggestContext } from "../editing/suggest";
import { StepForm } from "./StepForm";
import { VerbMenu } from "./VerbMenu";
import type { Verb } from "../schema";

export interface StepListShared {
  ixId: string;
  root: Step[];                      // the interaction's whole `do` list
  onRootChange(next: Step[]): void;
  issues: Issue[];
  nameOf(id: string): string | undefined;
  elements: { id: string; name: string }[];
  variables: string[];
  flows: string[];
  verbs: Verb[];
}

export function StepList({ listPath, steps, shared }: { listPath: StepPath; steps: Step[]; shared: StepListShared }) {
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-1">
      <ol className="flex flex-col gap-1">
        {steps.map((step, i) => (
          <li
            key={i}
            onDragOver={(e) => dragFrom !== null && e.preventDefault()}
            onDrop={() => {
              if (dragFrom !== null && dragFrom !== i) shared.onRootChange(moveStep(shared.root, listPath, dragFrom, i));
              setDragFrom(null);
            }}
          >
            <StepRow step={step} path={[...listPath, i]} index={i} count={steps.length} shared={shared} onDragStart={() => setDragFrom(i)} />
          </li>
        ))}
      </ol>
      <VerbMenu verbs={shared.verbs} onPick={(v) => shared.onRootChange(insertStep(shared.root, listPath, steps.length, defaultStep(v)))} />
    </div>
  );
}

function StepRow({ step, path, index, count, shared, onDragStart }: { step: Step; path: StepPath; index: number; count: number; shared: StepListShared; onDragStart(): void }) {
  const [open, setOpen] = useState(false);
  const p = issuePath(shared.ixId, path);
  const mine = shared.issues.filter((i) => i.path === p || i.path.startsWith(`${p}.`) && !i.path.slice(p.length).match(/^\.(then|else)\[/));
  const worst = mine.some((i) => i.level !== "warning") ? "error" : mine.length ? "warning" : null;
  const isIf = verbOf(step) === "if";
  const suggestCtx: SuggestContext = { variables: shared.variables, stepIds: stepIdsBefore(shared.root, path), elements: shared.elements };

  return (
    <div className="rounded-md border border-border bg-background">
      <div className="flex items-center gap-1 px-1 py-1">
        <span draggable onDragStart={onDragStart} className="cursor-grab text-muted-foreground" aria-label="Drag to reorder">
          <GripVertical className="h-3.5 w-3.5" />
        </span>
        <button type="button" className="flex min-w-0 flex-1 items-center gap-1 text-left text-[11px]" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <ChevronRight className={cn("h-3 w-3 shrink-0 transition-transform", open && "rotate-90")} />
          <span className="w-4 shrink-0 text-muted-foreground">{index + 1}</span>
          <span className="truncate">{summarize(step, shared.nameOf)}</span>
        </button>
        {worst && <AlertTriangle className={cn("h-3.5 w-3.5 shrink-0", worst === "error" ? "text-destructive" : "text-amber-500")} aria-label={mine[0].message} />}
        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Move step up" disabled={index === 0} onClick={() => shared.onRootChange(moveStep(shared.root, path.slice(0, -1), index, index - 1))}><ArrowUp /></Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Move step down" disabled={index === count - 1} onClick={() => shared.onRootChange(moveStep(shared.root, path.slice(0, -1), index, index + 1))}><ArrowDown /></Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Duplicate step" onClick={() => shared.onRootChange(insertStep(shared.root, path.slice(0, -1), index + 1, structuredClone(step)))}>
          <Copy className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Delete step" onClick={() => shared.onRootChange(removeStep(shared.root, path))}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      {open && (
        <div className="border-t border-border px-2 pb-2">
          <StepForm
            step={step}
            stepPath={p}
            issues={mine}
            onChange={(next) => shared.onRootChange(replaceStep(shared.root, path, next))}
            suggestCtx={suggestCtx}
            variables={shared.variables}
            flows={shared.flows}
          />
        </div>
      )}
      {isIf && (
        <div className="flex flex-col gap-1 border-t border-border py-1 pl-4 pr-1">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">Then</p>
          <StepList listPath={[...path, "then"]} steps={(step as IfStep).then ?? []} shared={shared} />
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">Else</p>
          <StepList listPath={[...path, "else"]} steps={(step as IfStep).else ?? []} shared={shared} />
        </div>
      )}
    </div>
  );
}
