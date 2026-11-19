import { useSelectedElement, useUpdateElement } from "@/features/editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REVEAL_EFFECTS, REVEAL_LABELS, readReveal, type RevealEffect } from "@/features/preview/lib/reveal";

const NONE = "none";
const DELAYS = [0, 100, 200, 300, 500, 800];

/**
 * Scroll reveal: the element fades or slides in when the visitor scrolls to
 * it. It shows on the published page; the editor canvas always shows the
 * element so it stays easy to edit.
 */
export function RevealSection({ disabled }: { disabled?: boolean }) {
  const element = useSelectedElement();
  const updateElement = useUpdateElement();
  if (!element) return null;

  const current = readReveal(element);
  const settings = ((element as unknown as { settings?: Record<string, unknown> | null }).settings ?? {}) as Record<string, unknown>;
  const write = (next: Record<string, unknown>) => {
    const merged: Record<string, unknown> = { ...settings, ...next };
    for (const key of Object.keys(merged)) if (merged[key] === undefined) delete merged[key];
    updateElement(element.id, { settings: Object.keys(merged).length ? merged : null } as Parameters<typeof updateElement>[1]);
  };

  return (
    <section className="flex flex-col gap-2 px-3 py-2.5">
      <span className="text-[11px] font-semibold text-muted-foreground">Scroll reveal</span>
      <div className="grid grid-cols-[1fr_88px] gap-2">
        <Select
          disabled={disabled}
          value={current?.effect ?? NONE}
          onValueChange={(v) => write(v === NONE ? { reveal: undefined, revealDelay: undefined } : { reveal: v as RevealEffect })}
        >
          <SelectTrigger aria-label="Scroll reveal effect" className="h-7 rounded-[5px] border-transparent bg-muted/50 text-[11px] shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>None</SelectItem>
            {REVEAL_EFFECTS.map((e) => (
              <SelectItem key={e} value={e}>
                {REVEAL_LABELS[e]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          disabled={disabled || !current}
          value={String(current?.delay ?? 0)}
          onValueChange={(v) => write({ revealDelay: Number(v) || undefined })}
        >
          <SelectTrigger aria-label="Scroll reveal delay" className="h-7 rounded-[5px] border-transparent bg-muted/50 text-[11px] shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DELAYS.map((d) => (
              <SelectItem key={d} value={String(d)}>
                {d === 0 ? "No delay" : `${d} ms`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-[10px] text-muted-foreground">Plays on the published page when this element scrolls into view.</p>
    </section>
  );
}
