"use client";

import { Accordion } from "@/components/ui/accordion";
import { AppearanceAccordion } from "./AppearanceAccordion";
import { TypographyAccordion } from "./TypographyAccordion";
import TailwindAccordion from "./TailwindAccordion";
import { BreakpointSelector } from "./BreakpointSelector";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import { useState } from "react";

export default function Styles() {
  const selectedElement = useSelectedElement();
  const [currentBreakpoint, setCurrentBreakpoint] = useState<
    "default" | "sm" | "md" | "lg" | "xl"
  >("default");

  if (!selectedElement) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-1">
      {/* Breakpoint bar */}
      <BreakpointSelector
        currentBreakpoint={currentBreakpoint}
        onBreakpointChange={setCurrentBreakpoint}
      />

      {/* Style accordions */}
      <Accordion
        type="multiple"
        defaultValue={["appearance", "typography", "tailwind"]}
        className="w-full flex flex-col gap-0.5"
      >
        <AppearanceAccordion currentBreakpoint={currentBreakpoint} />
        {selectedElement.type === "Text" && (
          <TypographyAccordion currentBreakpoint={currentBreakpoint} />
        )}
        <TailwindAccordion />
      </Accordion>
    </div>
  );
}
