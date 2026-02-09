import { Accordion } from "@/components/ui/accordion";
import { AppearanceAccordion } from "./AppearanceAccordion";
import { TypographyAccordion } from "./TypographyAccordion";
import TailwindAccordion from "./TailwindAccordion";
import { BreakpointSelector } from "./BreakpointSelector";
import { useSelectionStore } from "@/globalstore/selection-store";
import { useState } from "react";

export default function Styles() {
  const { selectedElement } = useSelectionStore();
  const [currentBreakpoint, setCurrentBreakpoint] = useState<
    "default" | "sm" | "md" | "lg" | "xl"
  >("default");

  if (!selectedElement) {
    return null;
  }

  return (
    <div className="w-full space-y-2">
      <BreakpointSelector
        currentBreakpoint={currentBreakpoint}
        onBreakpointChange={setCurrentBreakpoint}
      />
      <Accordion type="multiple" className="w-full space-y-2">
        <AppearanceAccordion currentBreakpoint={currentBreakpoint} />
        {selectedElement.type === "Text" && (
          <TypographyAccordion currentBreakpoint={currentBreakpoint} />
        )}
        <TailwindAccordion />
      </Accordion>
    </div>
  );
}
