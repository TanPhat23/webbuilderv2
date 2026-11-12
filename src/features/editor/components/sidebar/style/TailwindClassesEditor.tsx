import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useSelectedElement, useUpdateElement } from "@/features/editor";

export default function TailwindClassesEditor({
  disabled,
}: {
  disabled?: boolean;
}) {
  const updateElement = useUpdateElement();
  const element = useSelectedElement();
  const [value, setValue] = useState(element?.tailwindStyles ?? "");
  const timer = useRef<number | null>(null);

  useEffect(
    () => setValue(element?.tailwindStyles ?? ""),
    [element?.id, element?.tailwindStyles],
  );
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [element?.id, disabled],
  );

  if (!element) return null;
  const commit = (v: string) => {
    if (!disabled) updateElement(element.id, { tailwindStyles: v });
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setValue(next);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      commit(next);
      timer.current = null;
    }, 250);
  };

  const count = value.trim().split(/\s+/).filter(Boolean).length;
  return (
    <div className="flex flex-col gap-1">
      <Textarea
        aria-label="Tailwind classes"
        value={value}
        disabled={disabled}
        onChange={onChange}
        onBlur={() => {
          if (timer.current) {
            window.clearTimeout(timer.current);
            timer.current = null;
          }
          commit(value);
        }}
        placeholder="p-4 rounded-lg hover:opacity-80"
        rows={3}
        className="min-h-[64px] resize-y rounded-[5px] border-transparent bg-muted/50 font-mono text-[11px]! leading-relaxed shadow-none"
      />
      <p className="text-[10px] text-muted-foreground">
        {count} {count === 1 ? "class" : "classes"} · overrides the fields above
      </p>
    </div>
  );
}
