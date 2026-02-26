"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Type } from "lucide-react";

import { useUpdateElement } from "@/features/editor";
import { useSelectedElement } from "@/features/editor";
import { projectService } from "@/features/projects";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { ResponsiveStyles } from "@/features/editor";
import { AccordionSection, TypographyPanel } from "./_shared";
import type { TypographyValues } from "./_shared";

/* ─── Types ─── */

type TypographyStyles = Pick<
  React.CSSProperties,
  | "fontFamily"
  | "fontSize"
  | "fontWeight"
  | "fontStyle"
  | "color"
  | "lineHeight"
  | "letterSpacing"
  | "textAlign"
  | "textTransform"
  | "textDecoration"
  | "textShadow"
  | "wordSpacing"
  | "whiteSpace"
  | "textOverflow"
  | "wordBreak"
  | "wordWrap"
>;

interface TypographyAccordionProps {
  currentBreakpoint: "default" | "sm" | "md" | "lg" | "xl";
}


export const TypographyAccordion = ({
  currentBreakpoint,
}: TypographyAccordionProps) => {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  const [fonts, setFonts] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["fonts"],
    queryFn: () => projectService.getFonts(),
  });

  useEffect(() => {
    if (data && data.length > 0) {
      setFonts(data);
    }
  }, [data]);

  const responsiveStyles: ResponsiveStyles = selectedElement?.styles ?? {};
  const styles: TypographyStyles = responsiveStyles[currentBreakpoint] ?? {};

  const updateStyle = <K extends keyof TypographyStyles>(
    property: K,
    value: TypographyStyles[K],
  ) => {
    if (!selectedElement) return;
    const newStyles = { ...styles, [property]: value };
    elementHelper.updateElementStyle(
      selectedElement,
      newStyles,
      currentBreakpoint,
      updateElement,
    );
  };

  if (!selectedElement) return null;

  // Map CSSProperties → TypographyValues (the panel's clean interface)
  const values: TypographyValues = {
    fontFamily: styles.fontFamily as string | undefined,
    fontSize: styles.fontSize as string | number | undefined,
    fontWeight: styles.fontWeight as string | number | undefined,
    fontStyle: styles.fontStyle as TypographyValues["fontStyle"],
    color: styles.color as string | undefined,
    lineHeight: styles.lineHeight as string | number | undefined,
    letterSpacing: styles.letterSpacing as string | number | undefined,
    wordSpacing: styles.wordSpacing as string | number | undefined,
    textAlign: styles.textAlign as TypographyValues["textAlign"],
    textTransform: styles.textTransform as TypographyValues["textTransform"],
    textDecoration:
      typeof styles.textDecoration === "string"
        ? (styles.textDecoration as TypographyValues["textDecoration"])
        : undefined,
    textShadow: styles.textShadow as string | undefined,
    whiteSpace: styles.whiteSpace as TypographyValues["whiteSpace"],
    textOverflow: styles.textOverflow as TypographyValues["textOverflow"],
    wordBreak: styles.wordBreak as TypographyValues["wordBreak"],
  };

  return (
    <AccordionSection value="typography" title="Typography" icon={<Type />}>
      <TypographyPanel
        values={values}
        onChange={(property, value) =>
          updateStyle(
            property as keyof TypographyStyles,
            value as TypographyStyles[keyof TypographyStyles],
          )
        }
        fonts={isLoading ? [] : fonts}
      />
    </AccordionSection>
  );
};
