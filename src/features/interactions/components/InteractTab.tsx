// src/features/interactions/components/InteractTab.tsx
import { useMemo } from "react";
import { toast } from "sonner";
import { Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EditorElement } from "@/types/global.type";
import { useElements, useSelectedElement } from "@/features/editor";
import { validateInteractionMap, type Interaction } from "../schema";
import { referenceWarnings } from "../references";
import { getInteractions, type OpResult } from "../ops";
import { createOperations } from "../ops-store";
import { menuVerbs } from "../editing/fields";
import { InteractionCard } from "./InteractionCard";
import { useActiveLogic } from "../logic-hooks";

const operations = createOperations();

function flatten(tree: EditorElement[]): { id: string; name: string }[] {
  const out: { id: string; name: string }[] = [];
  const visit = (list: EditorElement[]) => {
    for (const el of list) {
      out.push({ id: el.id, name: el.name || `${el.type} ${el.id.slice(0, 4)}` });
      const kids = (el as unknown as { elements?: EditorElement[] }).elements;
      if (Array.isArray(kids)) visit(kids);
    }
  };
  visit(tree);
  return out;
}

export default function InteractTab() {
  const selected = useSelectedElement();
  const tree = useElements();
  const elements = useMemo(() => flatten(tree), [tree]);
  const names = useMemo(() => new Map(elements.map((e) => [e.id, e.name])), [elements]);
  const map = getInteractions(selected);
  const logic = useActiveLogic();
  const variableNames = useMemo(() => Object.keys(logic.variables), [logic.variables]);
  const flowNames = useMemo(() => Object.keys(logic.flows), [logic.flows]);

  const issues = useMemo(
    () => [
      ...validateInteractionMap(map),
      ...referenceWarnings(map, {
        elementIds: new Set(names.keys()),
        variables: new Set(variableNames),
        flows: new Set(flowNames),
      }),
    ],
    [map, names, variableNames, flowNames],
  );

  if (!selected) return null;

  const apply = (r: OpResult) => {
    if (!r.ok) toast.error(r.issues[0]?.message ?? "That change isn't valid");
  };
  const shared = {
    issues,
    nameOf: (id: string) => names.get(id),
    elements,
    variables: variableNames,
    flows: flowNames,
    verbs: menuVerbs({ variables: variableNames.length, flows: flowNames.length }),
  };
  const entries = Object.entries(map);

  return (
    <div className="flex flex-col gap-2 p-3">
      {entries.length === 0 && (
        <div className="flex flex-col items-center gap-1 py-6 text-center text-[11px] text-muted-foreground">
          <Zap className="h-4 w-4" />
          <p>Nothing happens when people interact with this element yet.</p>
        </div>
      )}
      {entries.map(([ixId, ix]) => (
        <InteractionCard
          key={ixId}
          ixId={ixId}
          ix={ix}
          shared={shared}
          onChange={(patch: Partial<Interaction>) =>
            apply(operations.updateInteraction(selected.id, ixId, patch, { allowIncomplete: true }))
          }
          onRemove={() => apply(operations.removeInteraction(selected.id, ixId))}
        />
      ))}
      <Button
        variant="outline"
        size="sm"
        className="h-7 w-full gap-1 text-[11px]"
        onClick={() => apply(operations.addInteraction(selected.id, "click", [], { allowIncomplete: true }))}
      >
        <Plus className="h-3 w-3" /> Add interaction
      </Button>
    </div>
  );
}
