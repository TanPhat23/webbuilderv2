"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useElementStore } from "@/globalstore/element-store";
import type { EditorElement } from "@/types/global.type";
import { Textarea } from "@/components/ui/textarea";
import { useSelectionStore } from "@/globalstore/selection-store";

export default function TailwindAccordion() {
  const { updateElement } = useElementStore();
  const { selectedElement } = useSelectionStore();
  const [value, setValue] = useState<string>(
    selectedElement?.tailwindStyles ?? "",
  );
  const debounceRef = useRef<number | null>(null);
  useEffect(() => {
    setValue(selectedElement?.tailwindStyles ?? "");
  }, [selectedElement?.id, selectedElement?.tailwindStyles]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, []);

  if (!selectedElement) return null;

  const commit = (val: string) => {
    updateElement(selectedElement.id, { tailwindStyles: val });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setValue(next);

    // client-side debounce to avoid spamming updateElement while typing
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      commit(next);
      debounceRef.current = null;
    }, 250) as unknown as number;
  };

  const handleBlur = () => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    commit(value);
  };

  return (
    <AccordionItem value="tailwind">
      <AccordionTrigger className="text-sm">Tailwind</AccordionTrigger>
      <AccordionContent>
        <div className="py-2 px-2">
          <label className="text-xs font-medium mb-1 block">
            Tailwind classes
          </label>
          <Textarea
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. p-4 bg-white rounded-lg shadow hover:scale-105"
            className="w-full"
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
