"use client";

import React, { useEffect, useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { projectService } from "@/services/project";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { useQuery } from "@tanstack/react-query";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import { cn } from "@/lib/utils";
import { ResponsiveStyles } from "@/interfaces/elements.interface";
import { AccordionSection, ConfigField, SliderField } from "./_shared";
import {
  Type,
  ALargeSmall,
  Space,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Underline,
  Strikethrough,
  Italic,
  WrapText,
  Minus,
} from "lucide-react";

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

/* ─── Constants ─── */

const FONT_FAMILIES = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "Roboto",
  "Open Sans",
  "Lato",
  "Figtree",
];

const FONT_WEIGHTS = [
  { label: "Thin", value: 100 },
  { label: "Extra Light", value: 200 },
  { label: "Light", value: 300 },
  { label: "Normal", value: 400 },
  { label: "Medium", value: 500 },
  { label: "Semi Bold", value: 600 },
  { label: "Bold", value: 700 },
  { label: "Extra Bold", value: 800 },
  { label: "Black", value: 900 },
];

/* ─── Toggle item with tooltip ─── */

function ToggleItem({
  value,
  label,
  children,
  className,
}: {
  value: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ToggleGroupItem
          value={value}
          aria-label={label}
          className={cn(
            "h-6 w-7 min-w-0 rounded-[4px] p-0",
            "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
            "transition-all duration-150 hover:text-foreground/80",
            className,
          )}
        >
          {children}
        </ToggleGroupItem>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-[10px]">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

/* ─── Compact labeled input ─── */

function CompactInput({
  label,
  value,
  onChange,
  placeholder = "0",
  suffix,
  className,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center h-7 rounded-md bg-muted/50 border border-border/40 overflow-hidden",
        "focus-within:border-foreground/30 focus-within:ring-1 focus-within:ring-foreground/10",
        "transition-colors",
        className,
      )}
    >
      <span className="flex items-center justify-center h-full px-1.5 text-[10px] font-medium text-muted-foreground select-none shrink-0 border-r border-border/30">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex-1 h-full bg-transparent px-1.5 text-[10px] font-mono tabular-nums text-foreground",
          "outline-none border-none min-w-0",
          "placeholder:text-muted-foreground/40",
        )}
      />
      {suffix && (
        <span className="flex items-center justify-center h-full px-1 text-[9px] text-muted-foreground/60 font-medium select-none shrink-0">
          {suffix}
        </span>
      )}
    </div>
  );
}

/* ─── Main Component ─── */

interface TypographyAccordionProps {
  currentBreakpoint: "default" | "sm" | "md" | "lg" | "xl";
}

export const TypographyAccordion = ({
  currentBreakpoint,
}: TypographyAccordionProps) => {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  const [fonts, setFonts] = useState<string[]>(FONT_FAMILIES);

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

  if (!selectedElement) {
    return null;
  }

  /* ─── Derived values ─── */

  const lineHeightNum =
    typeof styles.lineHeight === "string"
      ? parseFloat(styles.lineHeight) || 1.5
      : Number(styles.lineHeight) || 1.5;

  const letterSpacingNum =
    typeof styles.letterSpacing === "string"
      ? parseInt(styles.letterSpacing) || 0
      : Number(styles.letterSpacing) || 0;

  const textAlignValue = (styles.textAlign as string) || "";
  const textTransformValue = (styles.textTransform as string) || "";
  const textDecorationValue =
    typeof styles.textDecoration === "string" ? styles.textDecoration : "";
  const fontStyleValue = (styles.fontStyle as string) || "";

  return (
    <AccordionSection value="typography" title="Typography" icon={<Type />}>
      <Accordion
        type="multiple"
        defaultValue={["font", "spacing", "text", "effects", "overflow"]}
        className="w-full flex flex-col gap-0.5"
      >
        {/* ── Font Section ── */}
        <AccordionSection
          value="font"
          title="Font"
          icon={<ALargeSmall />}
          nested
        >
          {/* Font Family — full width select */}
          <ConfigField label="Family" hint="Font family for the text">
            <Select
              value={styles.fontFamily || ""}
              onValueChange={(value) => updateStyle("fontFamily", value)}
              disabled={isLoading}
            >
              <SelectTrigger className="h-7 w-full px-1.5 text-[10px] rounded-md">
                <SelectValue
                  placeholder={isLoading ? "Loading..." : "Select font"}
                />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((font) => (
                  <SelectItem key={font} value={font} className="text-[10px]">
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ConfigField>

          {/* Size + Weight — two column row */}
          <div className="grid grid-cols-2 gap-2">
            <CompactInput
              label="Sz"
              value={styles.fontSize?.toString() || ""}
              onChange={(val) => updateStyle("fontSize", val)}
              placeholder="16px"
            />
            <div>
              <Select
                value={styles.fontWeight?.toString() || "400"}
                onValueChange={(value) =>
                  updateStyle(
                    "fontWeight",
                    isNaN(Number(value)) ? value : Number(value),
                  )
                }
              >
                <SelectTrigger className="h-7 w-full px-1.5 text-[10px] rounded-md">
                  <SelectValue placeholder="Weight" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_WEIGHTS.map((fw) => (
                    <SelectItem
                      key={fw.value}
                      value={fw.value.toString()}
                      className="text-[10px]"
                    >
                      {fw.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Font Style toggle */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-muted-foreground select-none">
              Style
            </span>
            <ToggleGroup
              type="single"
              value={fontStyleValue || "normal"}
              onValueChange={(val) => {
                if (!val || val === "normal") {
                  updateStyle("fontStyle", undefined);
                } else {
                  updateStyle("fontStyle", val);
                }
              }}
              className="h-7 gap-0 rounded-md bg-muted/40 p-0.5"
            >
              <ToggleItem value="normal" label="Normal">
                <span className="text-[10px] font-medium">N</span>
              </ToggleItem>
              <ToggleItem value="italic" label="Italic">
                <Italic className="h-3 w-3" />
              </ToggleItem>
              <ToggleItem value="oblique" label="Oblique">
                <span className="text-[10px] font-medium italic skew-x-[-8deg]">
                  O
                </span>
              </ToggleItem>
            </ToggleGroup>
          </div>
        </AccordionSection>

        {/* ── Spacing Section ── */}
        <AccordionSection
          value="spacing"
          title="Spacing"
          icon={<Space />}
          nested
        >
          {/* Line Height */}
          <SliderField
            label="Line H"
            id="lineHeight"
            hint="Spacing between lines of text"
            value={lineHeightNum}
            onChange={(val) => updateStyle("lineHeight", String(val))}
            min={0.5}
            max={4}
            step={0.05}
            unit=""
            rawNumber={false}
            allowTextInput
            placeholder="1.5"
            inputWidth="w-12"
          />

          {/* Letter Spacing */}
          <SliderField
            label="Letter"
            id="letterSpacing"
            hint="Space between characters"
            value={letterSpacingNum}
            onChange={(val) => updateStyle("letterSpacing", `${val}px`)}
            min={-5}
            max={20}
            step={0.5}
            unit="px"
            inputWidth="w-12"
          />

          {/* Word Spacing */}
          <CompactInput
            label="Word"
            value={styles.wordSpacing?.toString() || ""}
            onChange={(val) => updateStyle("wordSpacing", val)}
            placeholder="normal"
            suffix="px"
          />
        </AccordionSection>

        {/* ── Text Section ── */}
        <AccordionSection value="text" title="Text" icon={<AlignLeft />} nested>
          {/* Text Align — icon toggle group */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-muted-foreground select-none">
              Align
            </span>
            <ToggleGroup
              type="single"
              value={textAlignValue}
              onValueChange={(val) => {
                updateStyle(
                  "textAlign",
                  !val ? undefined : (val as TypographyStyles["textAlign"]),
                );
              }}
              className="h-7 gap-0 rounded-md bg-muted/40 p-0.5"
            >
              <ToggleItem value="left" label="Align Left">
                <AlignLeft className="h-3 w-3" />
              </ToggleItem>
              <ToggleItem value="center" label="Align Center">
                <AlignCenter className="h-3 w-3" />
              </ToggleItem>
              <ToggleItem value="right" label="Align Right">
                <AlignRight className="h-3 w-3" />
              </ToggleItem>
              <ToggleItem value="justify" label="Justify">
                <AlignJustify className="h-3 w-3" />
              </ToggleItem>
            </ToggleGroup>
          </div>

          {/* Text Transform — text toggle group */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-muted-foreground select-none">
              Case
            </span>
            <ToggleGroup
              type="single"
              value={textTransformValue}
              onValueChange={(val) => {
                updateStyle(
                  "textTransform",
                  !val || val === "none"
                    ? undefined
                    : (val as TypographyStyles["textTransform"]),
                );
              }}
              className="h-7 gap-0 rounded-md bg-muted/40 p-0.5"
            >
              <ToggleItem value="none" label="None">
                <Minus className="h-3 w-3" />
              </ToggleItem>
              <ToggleItem value="capitalize" label="Capitalize">
                <span className="text-[9px] font-semibold leading-none">
                  Aa
                </span>
              </ToggleItem>
              <ToggleItem value="uppercase" label="Uppercase">
                <span className="text-[9px] font-semibold leading-none">
                  AA
                </span>
              </ToggleItem>
              <ToggleItem value="lowercase" label="Lowercase">
                <span className="text-[9px] font-semibold leading-none">
                  aa
                </span>
              </ToggleItem>
            </ToggleGroup>
          </div>

          {/* Text Decoration — icon toggle group */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-muted-foreground select-none">
              Decor
            </span>
            <ToggleGroup
              type="single"
              value={textDecorationValue}
              onValueChange={(val) => {
                updateStyle(
                  "textDecoration",
                  !val || val === "none" ? undefined : val,
                );
              }}
              className="h-7 gap-0 rounded-md bg-muted/40 p-0.5"
            >
              <ToggleItem value="none" label="None">
                <Minus className="h-3 w-3" />
              </ToggleItem>
              <ToggleItem value="underline" label="Underline">
                <Underline className="h-3 w-3" />
              </ToggleItem>
              <ToggleItem value="line-through" label="Strikethrough">
                <Strikethrough className="h-3 w-3" />
              </ToggleItem>
              <ToggleItem value="overline" label="Overline">
                <span className="text-[10px] font-medium leading-none overline">
                  O
                </span>
              </ToggleItem>
            </ToggleGroup>
          </div>
        </AccordionSection>

        {/* ── Effects Section ── */}
        <AccordionSection
          value="effects"
          title="Effects"
          icon={<Type />}
          nested
        >
          <ConfigField
            label="Shadow"
            hint="Text shadow (e.g. 2px 2px 4px rgba(0,0,0,0.5))"
          >
            <Input
              type="text"
              value={styles.textShadow || ""}
              placeholder="2px 2px 4px #000"
              onChange={(e) => updateStyle("textShadow", e.target.value)}
              className="h-7 w-full px-1.5 text-[10px] font-mono rounded-md"
            />
          </ConfigField>
        </AccordionSection>

        {/* ── Overflow Section ── */}
        <AccordionSection
          value="overflow"
          title="Overflow"
          icon={<WrapText />}
          nested
        >
          {/* White Space */}
          <ConfigField label="Wrap" hint="How whitespace is handled in text">
            <Select
              value={styles.whiteSpace || "normal"}
              onValueChange={(value) => updateStyle("whiteSpace", value)}
            >
              <SelectTrigger className="h-7 w-[80px] px-1.5 text-[10px] rounded-md">
                <SelectValue placeholder="Normal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal" className="text-[10px]">
                  Normal
                </SelectItem>
                <SelectItem value="nowrap" className="text-[10px]">
                  No Wrap
                </SelectItem>
                <SelectItem value="pre" className="text-[10px]">
                  Pre
                </SelectItem>
                <SelectItem value="pre-wrap" className="text-[10px]">
                  Pre Wrap
                </SelectItem>
                <SelectItem value="pre-line" className="text-[10px]">
                  Pre Line
                </SelectItem>
              </SelectContent>
            </Select>
          </ConfigField>

          {/* Text Overflow */}
          <ConfigField
            label="Overflow"
            hint="How overflowing text is displayed"
          >
            <Select
              value={styles.textOverflow || "clip"}
              onValueChange={(value) => updateStyle("textOverflow", value)}
            >
              <SelectTrigger className="h-7 w-[80px] px-1.5 text-[10px] rounded-md">
                <SelectValue placeholder="Clip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clip" className="text-[10px]">
                  Clip
                </SelectItem>
                <SelectItem value="ellipsis" className="text-[10px]">
                  Ellipsis
                </SelectItem>
              </SelectContent>
            </Select>
          </ConfigField>

          {/* Word Break */}
          <ConfigField label="Break" hint="How words break at end of line">
            <Select
              value={styles.wordBreak || "normal"}
              onValueChange={(value) =>
                updateStyle(
                  "wordBreak",
                  value as React.CSSProperties["wordBreak"],
                )
              }
            >
              <SelectTrigger className="h-7 w-[80px] px-1.5 text-[10px] rounded-md">
                <SelectValue placeholder="Normal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal" className="text-[10px]">
                  Normal
                </SelectItem>
                <SelectItem value="break-all" className="text-[10px]">
                  Break All
                </SelectItem>
                <SelectItem value="break-word" className="text-[10px]">
                  Break Word
                </SelectItem>
                <SelectItem value="keep-all" className="text-[10px]">
                  Keep All
                </SelectItem>
              </SelectContent>
            </Select>
          </ConfigField>
        </AccordionSection>
      </Accordion>
    </AccordionSection>
  );
};
