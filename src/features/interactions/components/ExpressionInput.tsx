// src/features/interactions/components/ExpressionInput.tsx
import { useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { suggest, type SuggestContext, type Suggestion } from "../editing/suggest";

interface Props {
  id?: string;
  value: string;
  onChange(value: string): void;
  ctx: SuggestContext;
  placeholder?: string;
  multiline?: boolean;
  invalid?: boolean;
  "aria-label": string;
}

/** Text field with `{{` autocomplete. */
export function ExpressionInput({ id, value, onChange, ctx, placeholder, multiline, invalid, ...rest }: Props) {
  const listId = useId();
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const [menu, setMenu] = useState<{ from: number; items: Suggestion[] } | null>(null);
  const [active, setActive] = useState(0);

  const refresh = (text: string, caret: number) => {
    setMenu(suggest(text, caret, ctx));
    setActive(0);
  };

  const apply = (item: Suggestion) => {
    const node = ref.current;
    if (!node || !menu) return;
    const caret = node.selectionStart ?? value.length;
    const next = value.slice(0, menu.from) + item.insert + value.slice(caret);
    onChange(next);
    const opensChildren = item.insert.endsWith(".");
    if (!opensChildren) setMenu(null);
    const pos = menu.from + item.insert.length;
    requestAnimationFrame(() => {
      node.setSelectionRange(pos, pos);
      if (opensChildren) refresh(next, pos);
    });
  };

  const common = {
    ref,
    id,
    value,
    placeholder,
    "aria-invalid": invalid || undefined,
    "aria-label": rest["aria-label"],
    "aria-autocomplete": "list" as const,
    "aria-expanded": !!menu,
    "aria-controls": menu ? listId : undefined,
    "aria-activedescendant": menu ? `${listId}-${active}` : undefined,
    className: cn("font-mono", invalid && "border-destructive"),
    onChange: (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => {
      onChange(e.target.value);
      refresh(e.target.value, e.target.selectionStart ?? e.target.value.length);
    },
    onBlur: () => setTimeout(() => setMenu(null), 120),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (!menu) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % menu.items.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + menu.items.length) % menu.items.length); }
      else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); apply(menu.items[active]); }
      else if (e.key === "Escape") setMenu(null);
    },
  };

  return (
    <div className="relative">
      {multiline ? <Textarea rows={3} {...common} /> : <Input {...common} />}
      {menu && (
        <ul id={listId} role="listbox" className="absolute left-0 right-0 top-full z-50 mt-1 max-h-40 overflow-y-auto rounded-md border border-border bg-popover py-1 text-[11px] shadow-md">
          {menu.items.map((item, i) => (
            <li
              key={item.insert}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={cn("flex cursor-pointer justify-between gap-2 px-2 py-1", i === active && "bg-accent")}
              onMouseDown={(e) => { e.preventDefault(); apply(item); }}
            >
              <span className="font-mono">{item.label}</span>
              {item.detail && <span className="truncate text-muted-foreground">{item.detail}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
