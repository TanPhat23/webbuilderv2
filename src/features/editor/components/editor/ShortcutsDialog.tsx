import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Mirrors useEditorShortcuts, useChromeShortcuts and the top bar's ⌘K. */
const SHORTCUTS: { label: string; keys: string[] }[] = [
  { label: "Copy", keys: ["⌘", "C"] },
  { label: "Paste", keys: ["⌘", "V"] },
  { label: "Cut", keys: ["⌘", "X"] },
  { label: "Undo", keys: ["⌘", "Z"] },
  { label: "Redo", keys: ["⌘", "Y"] },
  { label: "Delete element", keys: ["Delete"] },
  { label: "Deselect", keys: ["Esc"] },
  { label: "Switch page", keys: ["⌘", "K"] },
  { label: "Toggle left panel", keys: ["⌘", "\\"] },
  { label: "Toggle inspector", keys: ["⌘", "."] },
  { label: "Show shortcuts", keys: ["?"] },
];

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>⌘ is Ctrl on Windows and Linux.</DialogDescription>
        </DialogHeader>
        <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {SHORTCUTS.map((s) => (
            <li key={s.label} className="flex items-center justify-between py-1.5 text-sm">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="min-w-6 rounded border border-border bg-muted px-1.5 py-0.5 text-center font-mono text-[11px]"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
