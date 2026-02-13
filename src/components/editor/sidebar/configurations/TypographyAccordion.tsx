import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useElementStore } from "@/globalstore/element-store";
import { projectService } from "@/services/project";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useSelectionStore } from "@/globalstore/selection-store";
import { cn } from "@/lib/utils";
import { ResponsiveStyles } from "@/interfaces/elements.interface";

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

type TextAlign = "left" | "right" | "center" | "justify" | "start" | "end";
const TEXT_ALIGN_OPTIONS: TextAlign[] = [
  "left",
  "right",
  "center",
  "justify",
  "start",
  "end",
];

type TextTransform = "none" | "capitalize" | "uppercase" | "lowercase";
const TEXT_TRANSFORM_OPTIONS: TextTransform[] = [
  "none",
  "capitalize",
  "uppercase",
  "lowercase",
];

interface TypographyAccordionProps {
  currentBreakpoint: "default" | "sm" | "md" | "lg" | "xl";
}

export const TypographyAccordion = ({
  currentBreakpoint,
}: TypographyAccordionProps) => {
  const { updateElement } = useElementStore();
  const { selectedElement } = useSelectionStore();
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

  const [textColorSelectValue, setTextColorSelectValue] = useState<string>(
    () => {
      if (!styles.color) return "default";
      if (styles.color.startsWith("var(")) return styles.color;
      return "custom";
    },
  );

  useEffect(() => {
    setTextColorSelectValue(() => {
      if (!styles.color) return "default";
      if (styles.color.startsWith("var(")) return styles.color;
      return "custom";
    });
  }, [currentBreakpoint, styles.color]);

  const updateStyle = <K extends keyof TypographyStyles>(
    property: K,
    value: TypographyStyles[K],
  ) => {
    if (!selectedElement) return;
    const newStyles = { ...styles, [property]: value };
    const newResponsiveStyles = {
      ...responsiveStyles,
      [currentBreakpoint]: newStyles,
    };

    elementHelper.updateElementStyle(
      selectedElement,
      newStyles,
      currentBreakpoint,
      updateElement,
    );

    // Tailwind classes are now computed and persisted centrally by elementHelper.updateElementStyle.
  };

  if (!selectedElement) {
    return <AccordionItem value="typography"></AccordionItem>;
  }

  return (
    <AccordionItem value="typography">
      <AccordionTrigger className="text-sm">Typography</AccordionTrigger>
      <AccordionContent>
        <Accordion
          type="multiple"
          defaultValue={[
            "font-family",
            "font-size",
            "color",
            "font-weight",
            "line-height",
            "letter-spacing",
            "text-align",
            "text-transform",
            "font-style",
            "text-decoration",
            "text-shadow",
            "word-spacing",
            "white-space",
            "text-overflow",
          ]}
        >
          {/* Font Family */}
          <AccordionItem value="font-family">
            <AccordionTrigger className="text-xs">Font Family</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-5 py-1">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Label
                      htmlFor="fontFamily"
                      className="text-xs w-20 cursor-help"
                    >
                      Family
                    </Label>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    Choose the font family for the text.
                  </HoverCardContent>
                </HoverCard>
                <Select
                  value={styles.fontFamily}
                  onValueChange={(value) => updateStyle("fontFamily", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading fonts...
                      </SelectItem>
                    ) : (
                      fonts.map((font) => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Font Size */}
          <AccordionItem value="font-size">
            <AccordionTrigger className="text-xs">Font Size</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-5 py-1">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Label
                      htmlFor="fontSize"
                      className="text-xs w-20 cursor-help"
                    >
                      Size
                    </Label>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    Adjust the size of the text in pixels.
                  </HoverCardContent>
                </HoverCard>
                <Slider
                  id="fontSize"
                  min={8}
                  max={72}
                  step={1}
                  value={[
                    typeof styles.fontSize === "string"
                      ? parseInt(styles.fontSize)
                      : Number(styles.fontSize),
                  ]}
                  onValueChange={([val]) => updateStyle("fontSize", `${val}px`)}
                  className="w-32"
                />
                <Input
                  id="fontSize"
                  type="text"
                  value={styles.fontSize || ""}
                  placeholder="e.g. 16px"
                  onChange={(e) => updateStyle("fontSize", e.target.value)}
                  className="w-16 h-6 px-1 py-0 text-xs border"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Color Section */}
          <AccordionItem value="color">
            <AccordionTrigger className="text-xs">Color</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 py-1">
                <div className="flex items-center gap-5">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Label
                        htmlFor="textColor"
                        className="text-xs w-20 cursor-help"
                      >
                        Text Color
                      </Label>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      Select the color for the text.
                    </HoverCardContent>
                  </HoverCard>
                  <Select
                    value={textColorSelectValue}
                    onValueChange={(value) => {
                      setTextColorSelectValue(value);
                      updateStyle(
                        "color",
                        value === "default"
                          ? undefined
                          : value === "custom"
                            ? ""
                            : value,
                      );
                    }}
                  >
                    <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="var(--foreground)">
                        Foreground
                      </SelectItem>
                      <SelectItem value="var(--card-foreground)">
                        Card Foreground
                      </SelectItem>
                      <SelectItem value="var(--primary-foreground)">
                        Primary Foreground
                      </SelectItem>
                      <SelectItem value="var(--secondary-foreground)">
                        Secondary Foreground
                      </SelectItem>
                      <SelectItem value="var(--muted-foreground)">
                        Muted Foreground
                      </SelectItem>
                      <SelectItem value="var(--accent-foreground)">
                        Accent Foreground
                      </SelectItem>
                      <SelectItem value="var(--destructive-foreground)">
                        Destructive Foreground
                      </SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {textColorSelectValue === "custom" && (
                  <div className="flex items-center gap-5 ml-24">
                    <Input
                      id="textColor"
                      type="color"
                      value={styles.color || ""}
                      onChange={(e) => {
                        updateStyle("color", e.target.value);
                        setTextColorSelectValue("custom");
                      }}
                      className="w-6 h-6 p-0 border-none bg-transparent"
                    />
                    <Input
                      id="textColorHex"
                      type="text"
                      value={styles.color || ""}
                      maxLength={7}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^#([0-9A-Fa-f]{0,6})$/.test(val)) {
                          updateStyle("color", val);
                          setTextColorSelectValue("custom");
                        }
                      }}
                      className="w-16 h-6 px-1 py-0 text-xs border"
                    />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Font Weight */}
          <AccordionItem value="font-weight">
            <AccordionTrigger className="text-xs">Font Weight</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-5 py-1">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Label
                      htmlFor="fontWeight"
                      className="text-xs w-20 cursor-help"
                    >
                      Weight
                    </Label>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    Set the thickness of the font.
                  </HoverCardContent>
                </HoverCard>
                <Select
                  value={styles.fontWeight?.toString()}
                  onValueChange={(value) =>
                    updateStyle(
                      "fontWeight",
                      isNaN(Number(value)) ? value : Number(value),
                    )
                  }
                >
                  <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                    <SelectValue placeholder="Select weight" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_WEIGHTS.map((fw) => (
                      <SelectItem key={fw.value} value={fw.value.toString()}>
                        {fw.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Line Height */}
          <AccordionItem value="line-height">
            <AccordionTrigger className="text-xs">Line Height</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-5 py-1">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Label
                      htmlFor="lineHeight"
                      className="text-xs w-20 cursor-help"
                    >
                      Line Height
                    </Label>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    Adjust the spacing between lines of text.
                  </HoverCardContent>
                </HoverCard>
                <Slider
                  id="lineHeight"
                  min={1}
                  max={3}
                  step={0.01}
                  value={[
                    typeof styles.lineHeight === "string"
                      ? parseFloat(styles.lineHeight)
                      : Number(styles.lineHeight),
                  ]}
                  onValueChange={([val]) =>
                    updateStyle("lineHeight", val.toString())
                  }
                  className="w-32"
                />
                <Input
                  id="lineHeight"
                  type="text"
                  value={styles.lineHeight?.toString() || ""}
                  placeholder="e.g. 1.5"
                  onChange={(e) => updateStyle("lineHeight", e.target.value)}
                  className="w-16 h-6 px-1 py-0 text-xs border"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Letter Spacing */}
          <AccordionItem value="letter-spacing">
            <AccordionTrigger className="text-xs">
              Letter Spacing
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-5 py-1">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Label
                      htmlFor="letterSpacing"
                      className="text-xs w-20 cursor-help"
                    >
                      Spacing
                    </Label>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    Control the space between characters.
                  </HoverCardContent>
                </HoverCard>
                <Slider
                  id="letterSpacing"
                  min={-5}
                  max={20}
                  step={1}
                  value={[
                    typeof styles.letterSpacing === "string"
                      ? parseInt(styles.letterSpacing)
                      : Number(styles.letterSpacing),
                  ]}
                  onValueChange={([val]) =>
                    updateStyle("letterSpacing", `${val}px`)
                  }
                  className="w-32"
                />
                <Input
                  id="letterSpacing"
                  type="text"
                  value={styles.letterSpacing || ""}
                  placeholder="e.g. 2px"
                  onChange={(e) => updateStyle("letterSpacing", e.target.value)}
                  className="w-16 h-6 px-1 py-0 text-xs border"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Text Align */}
          <AccordionItem value="text-align">
            <AccordionTrigger className="text-xs">Text Align</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-5 py-1">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Label
                      htmlFor="textAlign"
                      className="text-xs w-20 cursor-help"
                    >
                      Align
                    </Label>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    Set the horizontal alignment of the text.
                  </HoverCardContent>
                </HoverCard>
                <Select
                  value={
                    TEXT_ALIGN_OPTIONS.includes(styles.textAlign as TextAlign)
                      ? (styles.textAlign as TextAlign)
                      : "default"
                  }
                  onValueChange={(value: TextAlign | "default") =>
                    updateStyle(
                      "textAlign",
                      value === "default" ? undefined : value,
                    )
                  }
                >
                  <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                    <SelectValue placeholder="Select align" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    {TEXT_ALIGN_OPTIONS.map((align) => (
                      <SelectItem key={align} value={align}>
                        {align.charAt(0).toUpperCase() + align.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Text Transform */}
          <AccordionItem value="text-transform">
            <AccordionTrigger className="text-xs">
              Text Transform
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-5 py-1">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Label
                      htmlFor="textTransform"
                      className="text-xs w-20 cursor-help"
                    >
                      Transform
                    </Label>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    Change the capitalization of the text.
                  </HoverCardContent>
                </HoverCard>
                <Select
                  value={
                    TEXT_TRANSFORM_OPTIONS.includes(
                      styles.textTransform as TextTransform,
                    )
                      ? (styles.textTransform as TextTransform)
                      : "default"
                  }
                  onValueChange={(value: TextTransform | "default") =>
                    updateStyle(
                      "textTransform",
                      value === "default" ? undefined : value,
                    )
                  }
                >
                  <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                    <SelectValue placeholder="Select transform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    {TEXT_TRANSFORM_OPTIONS.map((transform) => (
                      <SelectItem key={transform} value={transform}>
                        {transform.charAt(0).toUpperCase() + transform.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Font Style */}
          <AccordionItem value="font-style">
            <AccordionTrigger className="text-xs">Font Style</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-5 py-1">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Label
                      htmlFor="fontStyle"
                      className="text-xs w-20 cursor-help"
                    >
                      Style
                    </Label>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    Apply italic or oblique style to the font.
                  </HoverCardContent>
                </HoverCard>
                <Select
                  value={styles.fontStyle || "default"}
                  onValueChange={(value) =>
                    updateStyle(
                      "fontStyle",
                      value === "default" ? undefined : value,
                    )
                  }
                >
                  <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="italic">Italic</SelectItem>
                    <SelectItem value="oblique">Oblique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Text Decoration */}
          <AccordionItem value="text-decoration">
            <AccordionTrigger className="text-xs">
              Text Decoration
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-5 py-1">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Label
                      htmlFor="textDecoration"
                      className="text-xs w-20 cursor-help"
                    >
                      Decoration
                    </Label>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    Add underlines, overlines, or strikethrough to text.
                  </HoverCardContent>
                </HoverCard>
                <Select
                  value={
                    typeof styles.textDecoration === "string"
                      ? styles.textDecoration
                      : "default"
                  }
                  onValueChange={(value) =>
                    updateStyle(
                      "textDecoration",
                      value === "default" ? undefined : value,
                    )
                  }
                >
                  <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                    <SelectValue placeholder="Select decoration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="underline">Underline</SelectItem>
                    <SelectItem value="overline">Overline</SelectItem>
                    <SelectItem value="line-through">Line Through</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Text Shadow */}
          <AccordionItem value="text-shadow">
            <AccordionTrigger className="text-xs">Text Shadow</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-5 py-1">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Label
                      htmlFor="textShadow"
                      className="text-xs w-20 cursor-help"
                    >
                      Shadow
                    </Label>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    Add shadow effect to text (e.g., 2px 2px 4px
                    rgba(0,0,0,0.5)).
                  </HoverCardContent>
                </HoverCard>
                <Input
                  id="textShadow"
                  type="text"
                  value={styles.textShadow || ""}
                  placeholder="2px 2px 4px #000"
                  onChange={(e) => updateStyle("textShadow", e.target.value)}
                  className="w-40 h-6 px-1 py-0 text-xs border"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Word Spacing */}
          <AccordionItem value="word-spacing">
            <AccordionTrigger className="text-xs">
              Word Spacing
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-5 py-1">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Label
                      htmlFor="wordSpacing"
                      className="text-xs w-20 cursor-help"
                    >
                      Spacing
                    </Label>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    Adjust space between words.
                  </HoverCardContent>
                </HoverCard>
                <Input
                  id="wordSpacing"
                  type="text"
                  value={styles.wordSpacing || ""}
                  placeholder="2px"
                  onChange={(e) => updateStyle("wordSpacing", e.target.value)}
                  className="w-24 h-6 px-1 py-0 text-xs border"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* White Space */}
          <AccordionItem value="white-space">
            <AccordionTrigger className="text-xs">White Space</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-5 py-1">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Label
                      htmlFor="whiteSpace"
                      className="text-xs w-20 cursor-help"
                    >
                      White Space
                    </Label>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    Control how whitespace is handled in text.
                  </HoverCardContent>
                </HoverCard>
                <Select
                  value={styles.whiteSpace || "normal"}
                  onValueChange={(value) => updateStyle("whiteSpace", value)}
                >
                  <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="nowrap">No Wrap</SelectItem>
                    <SelectItem value="pre">Pre</SelectItem>
                    <SelectItem value="pre-wrap">Pre Wrap</SelectItem>
                    <SelectItem value="pre-line">Pre Line</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Text Overflow */}
          <AccordionItem value="text-overflow">
            <AccordionTrigger className="text-xs">
              Text Overflow
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-5 py-1">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Label
                      htmlFor="textOverflow"
                      className="text-xs w-20 cursor-help"
                    >
                      Overflow
                    </Label>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    Handle text that overflows its container.
                  </HoverCardContent>
                </HoverCard>
                <Select
                  value={styles.textOverflow || "clip"}
                  onValueChange={(value) => updateStyle("textOverflow", value)}
                >
                  <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clip">Clip</SelectItem>
                    <SelectItem value="ellipsis">Ellipsis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
};
