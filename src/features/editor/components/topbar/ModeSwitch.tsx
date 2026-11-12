import { useEditorContext } from "@/providers/editorprovider";
import {
  fromSurface,
  toSurface,
  type EditorSurface,
} from "@/features/editor/lib/editor-surface";
import { cn } from "@/lib/utils";

const SURFACES: { id: EditorSurface; label: string }[] = [
  { id: "design", label: "Design" },
  { id: "wireframe", label: "Wireframe" },
  { id: "code", label: "Code" },
];

export default function ModeSwitch() {
  const { mode, setMode, editingMode, setEditingMode } = useEditorContext();
  const current = toSurface(mode, editingMode);

  return (
    <div
      role="radiogroup"
      aria-label="Editor mode"
      className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5"
    >
      {SURFACES.map((s) => (
        <button
          key={s.id}
          type="button"
          role="radio"
          aria-checked={current === s.id}
          onClick={() => {
            const next = fromSurface(s.id);
            setEditingMode(next.editingMode);
            setMode(next.mode);
          }}
          className={cn(
            "h-7 rounded-md px-2.5 text-xs font-medium transition-colors",
            current === s.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
