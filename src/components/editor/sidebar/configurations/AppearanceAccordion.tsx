import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import React, { useEffect, useState } from "react";
import { useElementStore } from "@/globalstore/element-store";
import { useSelectionStore } from "@/globalstore/selection-store";
import { cn } from "@/lib/utils";
import { ResponsiveStyles } from "@/interfaces/elements.interface";

type AppearanceStyles = Pick<
  React.CSSProperties,
  // Size & Position
  | "height"
  | "width"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "position"
  | "zIndex"
  // Color & Border
  | "backgroundColor"
  | "color"
  | "borderColor"
  | "borderWidth"
  | "borderRadius"
  | "borderStyle"
  | "borderTopLeftRadius"
  | "borderTopRightRadius"
  | "borderBottomLeftRadius"
  | "borderBottomRightRadius"
  | "boxShadow"
  | "outline"
  | "outlineColor"
  | "outlineWidth"
  | "outlineStyle"
  // Background
  | "backgroundImage"
  | "backgroundSize"
  | "backgroundPosition"
  | "backgroundRepeat"
  | "backgroundAttachment"
  // Opacity & Visibility
  | "opacity"
  | "visibility"
  // Spacing
  | "padding"
  | "paddingTop"
  | "paddingBottom"
  | "paddingLeft"
  | "paddingRight"
  | "margin"
  | "marginTop"
  | "marginBottom"
  | "marginLeft"
  | "marginRight"
  // Flexbox
  | "display"
  | "flexDirection"
  | "flexWrap"
  | "justifyContent"
  | "alignItems"
  | "alignContent"
  | "gap"
  | "rowGap"
  | "columnGap"
  | "alignSelf"
  | "order"
  | "flex"
  | "flexGrow"
  | "flexShrink"
  | "flexBasis"
  // Grid
  | "gridTemplateColumns"
  | "gridTemplateRows"
  | "gridColumn"
  | "gridRow"
  | "gridColumnStart"
  | "gridColumnEnd"
  | "gridRowStart"
  | "gridRowEnd"
  | "gridGap"
  | "gridRowGap"
  | "gridColumnGap"
  | "placeItems"
  | "placeContent"
  | "placeSelf"
  | "justifyItems"
  // Transform & Effects
  | "transform"
  | "transformOrigin"
  | "filter"
  // Overflow & Scrolling
  | "overflow"
  | "overflowX"
  | "overflowY"
  // Cursor & Interaction
  | "cursor"
  // Box Model
  | "boxSizing"
  | "objectFit"
  | "aspectRatio"
  // Text Overflow
  | "textOverflow"
  | "whiteSpace"
  | "wordBreak"
  | "wordWrap"
>;

interface AppearanceAccordionProps {
  currentBreakpoint: "default" | "sm" | "md" | "lg" | "xl";
}

export const AppearanceAccordion = ({
  currentBreakpoint,
}: AppearanceAccordionProps) => {
  const { updateElement } = useElementStore();
  const { selectedElement } = useSelectionStore();

  const responsiveStyles: ResponsiveStyles = selectedElement?.styles ?? {};
  const styles: AppearanceStyles = responsiveStyles[currentBreakpoint] ?? {};
  const updateStyle = <K extends keyof AppearanceStyles>(
    property: K,
    value: AppearanceStyles[K],
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
  };

  const [bgSelectValue, setBgSelectValue] = useState<string>(() => {
    if (!styles.backgroundColor) return "default";
    if (styles.backgroundColor.startsWith("var("))
      return styles.backgroundColor;
    return "custom";
  });

  const [textSelectValue, setTextSelectValue] = useState<string>(() => {
    if (!styles.color) return "default";
    if (styles.color.startsWith("var(")) return styles.color;
    return "custom";
  });

  const [borderSelectValue, setBorderSelectValue] = useState<string>(() => {
    if (!styles.borderColor) return "default";
    if (styles.borderColor.startsWith("var(")) return styles.borderColor;
    return "custom";
  });

  useEffect(() => {
    setBgSelectValue(() => {
      if (!styles.backgroundColor) return "default";
      if (styles.backgroundColor.startsWith("var("))
        return styles.backgroundColor;
      return "custom";
    });
  }, [currentBreakpoint, styles.backgroundColor]);

  useEffect(() => {
    setTextSelectValue(() => {
      if (!styles.color) return "default";
      if (styles.color.startsWith("var(")) return styles.color;
      return "custom";
    });
  }, [currentBreakpoint, styles.color]);

  useEffect(() => {
    setBorderSelectValue(() => {
      if (!styles.borderColor) return "default";
      if (styles.borderColor.startsWith("var(")) return styles.borderColor;
      return "custom";
    });
  }, [currentBreakpoint, styles.borderColor]);

  if (!selectedElement) {
    return <AccordionItem value="appearance"></AccordionItem>;
  }

  return (
    <AccordionItem value="appearance">
      <AccordionTrigger className="text-sm">Appearance</AccordionTrigger>
      <AccordionContent>
        <Accordion
          type="multiple"
          defaultValue={[
            "size",
            "colors",
            "border",
            "box-shadow",
            "opacity",
            "padding",
            "margin",
            "size",
            "display",
            "position",
            "background",
            "transform",
            "effects",
            "overflow",
          ]}
        >
          {/* Size Section */}
          <AccordionItem value="size">
            <AccordionTrigger>Size</AccordionTrigger>
            <AccordionContent className="space-y-2 p-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-5">
                <Label>Width</Label>
                <Input
                  value={styles.width || "auto"}
                  onChange={(e) => updateStyle("width", e.target.value)}
                  className="w-full sm:w-24 h-8"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-5">
                <Label>Height</Label>
                <Input
                  value={styles.height || "auto"}
                  onChange={(e) => updateStyle("height", e.target.value)}
                  className="w-full sm:w-24 h-8"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          {/* Colors Section */}
          <AccordionItem value="colors">
            <AccordionTrigger className="text-xs">Colors</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 py-1">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-5">
                    <Label htmlFor="backgroundColor" className="text-xs w-16">
                      Background
                    </Label>
                    <Select
                      value={bgSelectValue}
                      onValueChange={(value) => {
                        setBgSelectValue(value);
                        updateStyle(
                          "backgroundColor",
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
                        <SelectItem value="var(--background)">
                          Background
                        </SelectItem>
                        <SelectItem value="var(--card)">Card</SelectItem>
                        <SelectItem value="var(--primary)">Primary</SelectItem>
                        <SelectItem value="var(--secondary)">
                          Secondary
                        </SelectItem>
                        <SelectItem value="var(--muted)">Muted</SelectItem>
                        <SelectItem value="var(--accent)">Accent</SelectItem>
                        <SelectItem value="var(--destructive)">
                          Destructive
                        </SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {bgSelectValue === "custom" && (
                    <div className="flex items-center gap-5 ml-20">
                      <Input
                        id="backgroundColor"
                        value={styles.backgroundColor || ""}
                        type="color"
                        onChange={(e) => {
                          updateStyle("backgroundColor", e.target.value);
                          setBgSelectValue("custom");
                        }}
                        className="w-6 h-6 p-0 border-none bg-transparent"
                      />
                      <Input
                        id="backgroundColorHex"
                        type="text"
                        value={styles.backgroundColor || ""}
                        maxLength={7}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^#([0-9A-Fa-f]{0,6})$/.test(val)) {
                            updateStyle("backgroundColor", val);
                            setBgSelectValue("custom");
                          }
                        }}
                        className="w-16 h-6 px-1 py-0 text-xs border"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-5">
                    <Label htmlFor="textColor" className="text-xs w-16">
                      Text
                    </Label>
                    <Select
                      value={textSelectValue}
                      onValueChange={(value) => {
                        setTextSelectValue(value);
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
                  {textSelectValue === "custom" && (
                    <div className="flex items-center gap-5 ml-20">
                      <Input
                        id="textColor"
                        type="color"
                        value={styles.color || ""}
                        onChange={(e) => {
                          updateStyle("color", e.target.value);
                          setTextSelectValue("custom");
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
                            setTextSelectValue("custom");
                          }
                        }}
                        className="w-16 h-6 px-1 py-0 text-xs border"
                      />
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Border Section */}
          <AccordionItem value="border">
            <AccordionTrigger className="text-xs">Border</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 py-1">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-5">
                    <Label htmlFor="borderColor" className="text-xs w-16">
                      Color
                    </Label>
                    <Select
                      value={borderSelectValue}
                      onValueChange={(value) => {
                        setBorderSelectValue(value);
                        updateStyle(
                          "borderColor",
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
                        <SelectItem value="var(--border)">Border</SelectItem>
                        <SelectItem value="var(--primary)">Primary</SelectItem>
                        <SelectItem value="var(--secondary)">
                          Secondary
                        </SelectItem>
                        <SelectItem value="var(--muted)">Muted</SelectItem>
                        <SelectItem value="var(--accent)">Accent</SelectItem>
                        <SelectItem value="var(--destructive)">
                          Destructive
                        </SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {borderSelectValue === "custom" && (
                    <div className="flex items-center gap-5 ml-20">
                      <Input
                        id="borderColor"
                        type="color"
                        value={styles.borderColor || ""}
                        onChange={(e) => {
                          updateStyle("borderColor", e.target.value);
                          setBorderSelectValue("custom");
                        }}
                        className="w-6 h-6 p-0 border-none bg-transparent"
                      />
                      <Input
                        id="borderColorHex"
                        type="text"
                        value={styles.borderColor || ""}
                        maxLength={7}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^#([0-9A-Fa-f]{0,6})$/.test(val)) {
                            updateStyle("borderColor", val);
                            setBorderSelectValue("custom");
                          }
                        }}
                        className="w-16 h-6 px-1 py-0 text-xs border"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="borderWidth" className="text-xs w-16">
                    Width
                  </Label>
                  <Slider
                    id="borderWidth"
                    min={0}
                    max={20}
                    step={1}
                    value={[
                      typeof styles.borderWidth === "number"
                        ? styles.borderWidth
                        : 0,
                    ]}
                    onValueChange={(vals) =>
                      updateStyle("borderWidth", vals[0])
                    }
                    className="flex-1"
                  />
                  <span className="text-xs w-6 text-right">
                    {styles.borderWidth}
                  </span>
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="borderStyle" className="text-xs w-16">
                    Style
                  </Label>
                  <Select
                    value={styles.borderStyle || "solid"}
                    onValueChange={(value) => updateStyle("borderStyle", value)}
                  >
                    <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                      <SelectValue placeholder="Style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                      <SelectItem value="groove">Groove</SelectItem>
                      <SelectItem value="ridge">Ridge</SelectItem>
                      <SelectItem value="inset">Inset</SelectItem>
                      <SelectItem value="outset">Outset</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="borderRadius" className="text-xs w-16">
                    Radius
                  </Label>
                  <Slider
                    id="borderRadius"
                    min={0}
                    max={100}
                    step={1}
                    value={[
                      typeof styles.borderRadius === "number"
                        ? styles.borderRadius
                        : 0,
                    ]}
                    onValueChange={(vals) =>
                      updateStyle("borderRadius", vals[0])
                    }
                    className="flex-1"
                  />
                  <span className="text-xs w-6 text-right">
                    {styles.borderRadius}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="borderTopLeftRadius"
                      className="text-xs w-8"
                    >
                      TL
                    </Label>
                    <Input
                      id="borderTopLeftRadius"
                      type="number"
                      value={styles.borderTopLeftRadius || ""}
                      onChange={(e) =>
                        updateStyle(
                          "borderTopLeftRadius",
                          `${e.target.value}px`,
                        )
                      }
                      className="w-12 h-6 px-1 py-0 text-xs border"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="borderTopRightRadius"
                      className="text-xs w-8"
                    >
                      TR
                    </Label>
                    <Input
                      id="borderTopRightRadius"
                      type="number"
                      value={styles.borderTopRightRadius || ""}
                      onChange={(e) =>
                        updateStyle(
                          "borderTopRightRadius",
                          `${e.target.value}px`,
                        )
                      }
                      className="w-12 h-6 px-1 py-0 text-xs border"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="borderBottomLeftRadius"
                      className="text-xs w-8"
                    >
                      BL
                    </Label>
                    <Input
                      id="borderBottomLeftRadius"
                      type="number"
                      value={styles.borderBottomLeftRadius || ""}
                      onChange={(e) =>
                        updateStyle(
                          "borderBottomLeftRadius",
                          `${e.target.value}px`,
                        )
                      }
                      className="w-12 h-6 px-1 py-0 text-xs border"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="borderBottomRightRadius"
                      className="text-xs w-8"
                    >
                      BR
                    </Label>
                    <Input
                      id="borderBottomRightRadius"
                      type="number"
                      value={styles.borderBottomRightRadius || ""}
                      onChange={(e) =>
                        updateStyle(
                          "borderBottomRightRadius",
                          `${e.target.value}px`,
                        )
                      }
                      className="w-12 h-6 px-1 py-0 text-xs border"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Box Shadow Section */}
          <AccordionItem value="box-shadow">
            <AccordionTrigger className="text-xs">Box Shadow</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-5 py-1">
                <Label htmlFor="boxShadow" className="text-xs w-16">
                  Shadow
                </Label>
                <Select
                  value={styles.boxShadow ? styles.boxShadow : "none"}
                  onValueChange={(value) =>
                    updateStyle(
                      "boxShadow",
                      value === "none" ? undefined : value,
                    )
                  }
                >
                  <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                    <SelectValue placeholder="Select shadow" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="var(--shadow-2xs)">2xs</SelectItem>
                    <SelectItem value="var(--shadow-xs)">xs</SelectItem>
                    <SelectItem value="var(--shadow-sm)">sm</SelectItem>
                    <SelectItem value="var(--shadow)">default</SelectItem>
                    <SelectItem value="var(--shadow-md)">md</SelectItem>
                    <SelectItem value="var(--shadow-lg)">lg</SelectItem>
                    <SelectItem value="var(--shadow-xl)">xl</SelectItem>
                    <SelectItem value="var(--shadow-2xl)">2xl</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Opacity Section */}
          <AccordionItem value="opacity">
            <AccordionTrigger className="text-xs">Opacity</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-5 py-1">
                <Label htmlFor="opacity" className="text-xs w-16">
                  Opacity
                </Label>
                <Slider
                  id="opacity"
                  min={0}
                  max={100}
                  step={1}
                  value={[
                    typeof styles.opacity === "number"
                      ? Math.round(styles.opacity * 100)
                      : 100,
                  ]}
                  onValueChange={(vals) =>
                    updateStyle("opacity", vals[0] / 100)
                  }
                  className="flex-1"
                />
                <span className="text-xs w-6 text-right">
                  {typeof styles.opacity === "number"
                    ? Math.round(styles.opacity * 100)
                    : 100}
                </span>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Padding Section */}
          <AccordionItem value="padding">
            <AccordionTrigger className="text-xs">Padding</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 py-1">
                <div className="flex items-center gap-5">
                  <Label htmlFor="paddingTop" className="text-xs w-16">
                    Top
                  </Label>
                  <Slider
                    id="paddingTop"
                    min={0}
                    max={100}
                    step={1}
                    value={[
                      typeof styles.paddingTop === "string"
                        ? parseInt(styles.paddingTop)
                        : Number(styles.paddingTop),
                    ]}
                    onValueChange={([val]) =>
                      updateStyle("paddingTop", `${val}px`)
                    }
                    className="w-32"
                  />
                  <Input
                    id="paddingTop"
                    type="text"
                    value={styles.paddingTop || ""}
                    placeholder="e.g. 10px"
                    onChange={(e) => updateStyle("paddingTop", e.target.value)}
                    className="w-20 h-6 px-1 py-0 text-xs border"
                  />
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="paddingBottom" className="text-xs w-16">
                    Bottom
                  </Label>
                  <Slider
                    id="paddingBottom"
                    min={0}
                    max={100}
                    step={1}
                    value={[
                      typeof styles.paddingBottom === "string"
                        ? parseInt(styles.paddingBottom)
                        : Number(styles.paddingBottom),
                    ]}
                    onValueChange={([val]) =>
                      updateStyle("paddingBottom", `${val}px`)
                    }
                    className="w-32"
                  />
                  <Input
                    id="paddingBottom"
                    type="text"
                    value={styles.paddingBottom || ""}
                    placeholder="e.g. 10px"
                    onChange={(e) =>
                      updateStyle("paddingBottom", e.target.value)
                    }
                    className="w-20 h-6 px-1 py-0 text-xs border"
                  />
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="paddingLeft" className="text-xs w-16">
                    Left
                  </Label>
                  <Slider
                    id="paddingLeft"
                    min={0}
                    max={100}
                    step={1}
                    value={[
                      typeof styles.paddingLeft === "string"
                        ? parseInt(styles.paddingLeft)
                        : Number(styles.paddingLeft),
                    ]}
                    onValueChange={([val]) =>
                      updateStyle("paddingLeft", `${val}px`)
                    }
                    className="w-32"
                  />
                  <Input
                    id="paddingLeft"
                    type="text"
                    value={styles.paddingLeft || ""}
                    placeholder="e.g. 10px"
                    onChange={(e) => updateStyle("paddingLeft", e.target.value)}
                    className="w-20 h-6 px-1 py-0 text-xs border"
                  />
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="paddingRight" className="text-xs w-16">
                    Right
                  </Label>
                  <Slider
                    id="paddingRight"
                    min={0}
                    max={100}
                    step={1}
                    value={[
                      typeof styles.paddingRight === "string"
                        ? parseInt(styles.paddingRight)
                        : Number(styles.paddingRight),
                    ]}
                    onValueChange={([val]) =>
                      updateStyle("paddingRight", `${val}px`)
                    }
                    className="w-32"
                  />
                  <Input
                    id="paddingRight"
                    type="text"
                    value={styles.paddingRight || ""}
                    placeholder="e.g. 10px"
                    onChange={(e) =>
                      updateStyle("paddingRight", e.target.value)
                    }
                    className="w-20 h-6 px-1 py-0 text-xs border"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Margin Section */}
          <AccordionItem value="margin">
            <AccordionTrigger className="text-xs">Margin</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 py-1">
                <div className="flex items-center gap-5">
                  <Label htmlFor="marginTop" className="text-xs w-16">
                    Top
                  </Label>
                  <Slider
                    id="marginTop"
                    min={0}
                    max={100}
                    step={1}
                    value={[
                      typeof styles.marginTop === "string"
                        ? parseInt(styles.marginTop)
                        : Number(styles.marginTop),
                    ]}
                    onValueChange={([val]) =>
                      updateStyle("marginTop", `${val}px`)
                    }
                    className="w-32"
                  />
                  <Input
                    id="marginTop"
                    type="text"
                    value={styles.marginTop || ""}
                    placeholder="e.g. 10px"
                    onChange={(e) => updateStyle("marginTop", e.target.value)}
                    className="w-20 h-6 px-1 py-0 text-xs border"
                  />
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="marginBottom" className="text-xs w-16">
                    Bottom
                  </Label>
                  <Slider
                    id="marginBottom"
                    min={0}
                    max={100}
                    step={1}
                    value={[
                      typeof styles.marginBottom === "string"
                        ? parseInt(styles.marginBottom)
                        : Number(styles.marginBottom),
                    ]}
                    onValueChange={([val]) =>
                      updateStyle("marginBottom", `${val}px`)
                    }
                    className="w-32"
                  />
                  <Input
                    id="marginBottom"
                    type="text"
                    value={styles.marginBottom || ""}
                    placeholder="e.g. 10px"
                    onChange={(e) =>
                      updateStyle("marginBottom", e.target.value)
                    }
                    className="w-20 h-6 px-1 py-0 text-xs border"
                  />
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="marginLeft" className="text-xs w-16">
                    Left
                  </Label>
                  <Slider
                    id="marginLeft"
                    min={0}
                    max={100}
                    step={1}
                    value={[
                      typeof styles.marginLeft === "string"
                        ? parseInt(styles.marginLeft)
                        : Number(styles.marginLeft),
                    ]}
                    onValueChange={([val]) =>
                      updateStyle("marginLeft", `${val}px`)
                    }
                    className="w-32"
                  />
                  <Input
                    id="marginLeft"
                    type="text"
                    value={styles.marginLeft || ""}
                    placeholder="e.g. 10px"
                    onChange={(e) => updateStyle("marginLeft", e.target.value)}
                    className="w-20 h-6 px-1 py-0 text-xs border"
                  />
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="marginRight" className="text-xs w-16">
                    Right
                  </Label>
                  <Slider
                    id="marginRight"
                    min={0}
                    max={100}
                    step={1}
                    value={[
                      typeof styles.marginRight === "string"
                        ? parseInt(styles.marginRight)
                        : Number(styles.marginRight),
                    ]}
                    onValueChange={([val]) =>
                      updateStyle("marginRight", `${val}px`)
                    }
                    className="w-32"
                  />
                  <Input
                    id="marginRight"
                    type="text"
                    value={styles.marginRight || ""}
                    placeholder="e.g. 10px"
                    onChange={(e) => updateStyle("marginRight", e.target.value)}
                    className="w-20 h-6 px-1 py-0 text-xs border"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Display Section */}
          <AccordionItem value="display">
            <AccordionTrigger className="text-xs">
              Display & Layout
            </AccordionTrigger>
            <AccordionContent>
              {/* Position Control */}
              <div className="mb-4">
                <Label htmlFor="position" className="text-xs w-16">
                  Position
                </Label>
                <Select
                  value={styles.position || "static"}
                  onValueChange={(value) =>
                    updateStyle(
                      "position",
                      value === "static"
                        ? undefined
                        : (value as React.CSSProperties["position"]),
                    )
                  }
                >
                  <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                    <SelectValue placeholder="Position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="static">Static</SelectItem>
                    <SelectItem value="relative">Relative</SelectItem>
                    <SelectItem value="absolute">Absolute</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="sticky">Sticky</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Display Control */}
              <div className="mb-4">
                <Label htmlFor="display" className="text-xs w-16">
                  Display
                </Label>
                <Select
                  value={styles.display || "block"}
                  onValueChange={(value) => updateStyle("display", value)}
                >
                  <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                    <SelectValue placeholder="Display" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="inline-block">Inline Block</SelectItem>
                    <SelectItem value="flex">Flex</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Flex Controls */}
              {styles.display === "flex" && (
                <div className="flex flex-col gap-3 mb-2 pl-2 border-l border-gray-200">
                  <div>
                    <Label className="text-xs">Flex Direction</Label>
                    <Select
                      value={styles.flexDirection || "row"}
                      onValueChange={(value) =>
                        updateStyle(
                          "flexDirection",
                          value as React.CSSProperties["flexDirection"],
                        )
                      }
                    >
                      <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                        <SelectValue placeholder="Direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="row">Row</SelectItem>
                        <SelectItem value="row-reverse">Row Reverse</SelectItem>
                        <SelectItem value="column">Column</SelectItem>
                        <SelectItem value="column-reverse">
                          Column Reverse
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Flex Wrap</Label>
                    <Select
                      value={styles.flexWrap || "nowrap"}
                      onValueChange={(value) =>
                        updateStyle(
                          "flexWrap",
                          value as React.CSSProperties["flexWrap"],
                        )
                      }
                    >
                      <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                        <SelectValue placeholder="Wrap" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nowrap">No Wrap</SelectItem>
                        <SelectItem value="wrap">Wrap</SelectItem>
                        <SelectItem value="wrap-reverse">
                          Wrap Reverse
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Justify Content</Label>
                    <Select
                      value={styles.justifyContent || "flex-start"}
                      onValueChange={(value) =>
                        updateStyle("justifyContent", value)
                      }
                    >
                      <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                        <SelectValue placeholder="Justify" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flex-start">Start</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="flex-end">End</SelectItem>
                        <SelectItem value="space-between">
                          Space Between
                        </SelectItem>
                        <SelectItem value="space-around">
                          Space Around
                        </SelectItem>
                        <SelectItem value="space-evenly">
                          Space Evenly
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Align Items</Label>
                    <Select
                      value={styles.alignItems || "stretch"}
                      onValueChange={(value) =>
                        updateStyle("alignItems", value)
                      }
                    >
                      <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                        <SelectValue placeholder="Align" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stretch">Stretch</SelectItem>
                        <SelectItem value="flex-start">Start</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="flex-end">End</SelectItem>
                        <SelectItem value="baseline">Baseline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Gap</Label>
                    <div className="flex items-center gap-8">
                      <Input
                        type="text"
                        value={styles.gap || ""}
                        placeholder="e.g. 10px"
                        onChange={(e) => updateStyle("gap", e.target.value)}
                        className="w-32 h-6 px-1 py-0 text-xs border"
                      />
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[
                          typeof styles.gap === "string"
                            ? parseInt(styles.gap, 10) || 0
                            : Number(styles.gap) || 0,
                        ]}
                        onValueChange={([val]) =>
                          updateStyle("gap", `${val}px`)
                        }
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
              )}
              {/* Grid Controls */}
              {styles.display === "grid" && (
                <div className="flex flex-col gap-3 mb-2 pl-2 border-l border-gray-200">
                  <div>
                    <Label className="text-xs">Grid Template Columns</Label>
                    <Input
                      value={styles.gridTemplateColumns?.toString() || ""}
                      onChange={(e) =>
                        updateStyle("gridTemplateColumns", e.target.value)
                      }
                      placeholder="e.g. 1fr 1fr"
                      className="w-40"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Grid Template Rows</Label>
                    <Input
                      value={styles.gridTemplateRows?.toString() || ""}
                      onChange={(e) =>
                        updateStyle("gridTemplateRows", e.target.value)
                      }
                      placeholder="e.g. auto 1fr"
                      className="w-40"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Gap</Label>
                    <Input
                      value={styles.gap?.toString() || ""}
                      onChange={(e) => updateStyle("gap", e.target.value)}
                      placeholder="e.g. 8px"
                      className="w-24"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Column Gap</Label>
                    <Input
                      value={styles.columnGap?.toString() || ""}
                      onChange={(e) => updateStyle("columnGap", e.target.value)}
                      placeholder="e.g. 16px"
                      className="w-24"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Row Gap</Label>
                    <Input
                      value={styles.rowGap?.toString() || ""}
                      onChange={(e) => updateStyle("rowGap", e.target.value)}
                      placeholder="e.g. 8px"
                      className="w-24"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Justify Items</Label>
                    <Select
                      value={styles.justifyItems || "stretch"}
                      onValueChange={(value) =>
                        updateStyle("justifyItems", value)
                      }
                    >
                      <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                        <SelectValue placeholder="Justify Items" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stretch">Stretch</SelectItem>
                        <SelectItem value="start">Start</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="end">End</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Align Items</Label>
                    <Select
                      value={styles.alignItems || "stretch"}
                      onValueChange={(value) =>
                        updateStyle("alignItems", value)
                      }
                    >
                      <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                        <SelectValue placeholder="Align Items" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stretch">Stretch</SelectItem>
                        <SelectItem value="start">Start</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="end">End</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Position & Z-Index Section */}
          <AccordionItem value="position">
            <AccordionTrigger className="text-xs">
              Position & Z-Index
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 py-1">
                <div className="flex items-center gap-5">
                  <Label htmlFor="position" className="text-xs w-16">
                    Position
                  </Label>
                  <Select
                    value={styles.position || "default"}
                    onValueChange={(value) =>
                      updateStyle(
                        "position",
                        value === "default"
                          ? undefined
                          : (value as React.CSSProperties["position"]),
                      )
                    }
                  >
                    <SelectTrigger className="w-24 max-h-6 px-1 py-0 text-xs border">
                      <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="static">Static</SelectItem>
                      <SelectItem value="relative">Relative</SelectItem>
                      <SelectItem value="absolute">Absolute</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="sticky">Sticky</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="zIndex" className="text-xs w-16">
                    Z-Index
                  </Label>
                  <Input
                    id="zIndex"
                    type="number"
                    value={styles.zIndex ?? ""}
                    onChange={(e) =>
                      updateStyle("zIndex", parseInt(e.target.value, 10))
                    }
                    className="w-20 h-6 px-1 py-0 text-xs border"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Position Values Section */}
          {(styles.position === "absolute" ||
            styles.position === "relative") && (
            <AccordionItem value="position-values">
              <AccordionTrigger className="text-xs">
                Position Values
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2 py-1">
                  <div className="flex items-center gap-5">
                    <Label htmlFor="top" className="text-xs w-16">
                      Top
                    </Label>
                    <Input
                      id="top"
                      type="text"
                      value={styles.top || ""}
                      placeholder="e.g. 10px"
                      onChange={(e) => updateStyle("top", e.target.value)}
                      className="w-20 h-6 px-1 py-0 text-xs border"
                    />
                  </div>
                  <div className="flex items-center gap-5">
                    <Label htmlFor="bottom" className="text-xs w-16">
                      Bottom
                    </Label>
                    <Input
                      id="bottom"
                      type="text"
                      value={styles.bottom || ""}
                      placeholder="e.g. 10px"
                      onChange={(e) => updateStyle("bottom", e.target.value)}
                      className="w-20 h-6 px-1 py-0 text-xs border"
                    />
                  </div>
                  <div className="flex items-center gap-5">
                    <Label htmlFor="left" className="text-xs w-16">
                      Left
                    </Label>
                    <Input
                      id="left"
                      type="text"
                      value={styles.left || ""}
                      placeholder="e.g. 10px"
                      onChange={(e) => updateStyle("left", e.target.value)}
                      className="w-20 h-6 px-1 py-0 text-xs border"
                    />
                  </div>
                  <div className="flex items-center gap-5">
                    <Label htmlFor="right" className="text-xs w-16">
                      Right
                    </Label>
                    <Input
                      id="right"
                      type="text"
                      value={styles.right || ""}
                      placeholder="e.g. 10px"
                      onChange={(e) => updateStyle("right", e.target.value)}
                      className="w-20 h-6 px-1 py-0 text-xs border"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Background Section */}
          <AccordionItem value="background">
            <AccordionTrigger className="text-xs">Background</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 py-1">
                <div className="flex items-center gap-5">
                  <Label htmlFor="backgroundImage" className="text-xs w-20">
                    Image URL
                  </Label>
                  <Input
                    id="backgroundImage"
                    type="text"
                    value={styles.backgroundImage || ""}
                    placeholder="url(https://...)"
                    onChange={(e) =>
                      updateStyle("backgroundImage", e.target.value)
                    }
                    className="w-40 h-6 px-1 py-0 text-xs border"
                  />
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="backgroundSize" className="text-xs w-20">
                    Size
                  </Label>
                  <Select
                    value={styles.backgroundSize?.toString() || "auto"}
                    onValueChange={(value) =>
                      updateStyle("backgroundSize", value)
                    }
                  >
                    <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                      <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="cover">Cover</SelectItem>
                      <SelectItem value="contain">Contain</SelectItem>
                      <SelectItem value="100% 100%">100%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="backgroundPosition" className="text-xs w-20">
                    Position
                  </Label>
                  <Input
                    id="backgroundPosition"
                    type="text"
                    value={styles.backgroundPosition || ""}
                    placeholder="center center"
                    onChange={(e) =>
                      updateStyle("backgroundPosition", e.target.value)
                    }
                    className="w-32 h-6 px-1 py-0 text-xs border"
                  />
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="backgroundRepeat" className="text-xs w-20">
                    Repeat
                  </Label>
                  <Select
                    value={styles.backgroundRepeat || "repeat"}
                    onValueChange={(value) =>
                      updateStyle("backgroundRepeat", value)
                    }
                  >
                    <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                      <SelectValue placeholder="Repeat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="repeat">Repeat</SelectItem>
                      <SelectItem value="no-repeat">No Repeat</SelectItem>
                      <SelectItem value="repeat-x">Repeat X</SelectItem>
                      <SelectItem value="repeat-y">Repeat Y</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Transform Section */}
          <AccordionItem value="transform">
            <AccordionTrigger className="text-xs">Transform</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 py-1">
                <div className="flex items-center gap-5">
                  <Label htmlFor="transform" className="text-xs w-20">
                    Transform
                  </Label>
                  <Input
                    id="transform"
                    type="text"
                    value={styles.transform || ""}
                    placeholder="rotate(45deg) scale(1.2)"
                    onChange={(e) => updateStyle("transform", e.target.value)}
                    className="w-48 h-6 px-1 py-0 text-xs border"
                  />
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="transformOrigin" className="text-xs w-20">
                    Origin
                  </Label>
                  <Input
                    id="transformOrigin"
                    type="text"
                    value={styles.transformOrigin || ""}
                    placeholder="center center"
                    onChange={(e) =>
                      updateStyle("transformOrigin", e.target.value)
                    }
                    className="w-32 h-6 px-1 py-0 text-xs border"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Effects Section */}
          <AccordionItem value="effects">
            <AccordionTrigger className="text-xs">Effects</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 py-1">
                <div className="flex items-center gap-5">
                  <Label htmlFor="filter" className="text-xs w-20">
                    Filter
                  </Label>
                  <Input
                    id="filter"
                    type="text"
                    value={styles.filter || ""}
                    placeholder="blur(5px) brightness(1.2)"
                    onChange={(e) => updateStyle("filter", e.target.value)}
                    className="w-48 h-6 px-1 py-0 text-xs border"
                  />
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="cursor" className="text-xs w-20">
                    Cursor
                  </Label>
                  <Select
                    value={styles.cursor || "auto"}
                    onValueChange={(value) => updateStyle("cursor", value)}
                  >
                    <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                      <SelectValue placeholder="Cursor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="pointer">Pointer</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="move">Move</SelectItem>
                      <SelectItem value="not-allowed">Not Allowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="visibility" className="text-xs w-20">
                    Visibility
                  </Label>
                  <Select
                    value={styles.visibility || "visible"}
                    onValueChange={(value) =>
                      updateStyle(
                        "visibility",
                        value as "visible" | "hidden" | "collapse",
                      )
                    }
                  >
                    <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                      <SelectValue placeholder="Visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visible">Visible</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                      <SelectItem value="collapse">Collapse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Overflow Section */}
          <AccordionItem value="overflow">
            <AccordionTrigger className="text-xs">Overflow</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 py-1">
                <div className="flex items-center gap-5">
                  <Label htmlFor="overflow" className="text-xs w-20">
                    Overflow
                  </Label>
                  <Select
                    value={styles.overflow || "visible"}
                    onValueChange={(value) =>
                      updateStyle(
                        "overflow",
                        value as "visible" | "hidden" | "scroll" | "auto",
                      )
                    }
                  >
                    <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                      <SelectValue placeholder="Overflow" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visible">Visible</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                      <SelectItem value="scroll">Scroll</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="overflowX" className="text-xs w-20">
                    Overflow X
                  </Label>
                  <Select
                    value={styles.overflowX || "visible"}
                    onValueChange={(value) =>
                      updateStyle(
                        "overflowX",
                        value as "visible" | "hidden" | "scroll" | "auto",
                      )
                    }
                  >
                    <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                      <SelectValue placeholder="X" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visible">Visible</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                      <SelectItem value="scroll">Scroll</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="overflowY" className="text-xs w-20">
                    Overflow Y
                  </Label>
                  <Select
                    value={styles.overflowY || "visible"}
                    onValueChange={(value) =>
                      updateStyle(
                        "overflowY",
                        value as "visible" | "hidden" | "scroll" | "auto",
                      )
                    }
                  >
                    <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                      <SelectValue placeholder="Y" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visible">Visible</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                      <SelectItem value="scroll">Scroll</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-5">
                  <Label htmlFor="boxSizing" className="text-xs w-20">
                    Box Sizing
                  </Label>
                  <Select
                    value={styles.boxSizing || "content-box"}
                    onValueChange={(value) =>
                      updateStyle(
                        "boxSizing",
                        value as "content-box" | "border-box",
                      )
                    }
                  >
                    <SelectTrigger className="w-32 max-h-6 px-1 py-0 text-xs border">
                      <SelectValue placeholder="Box Sizing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content-box">Content Box</SelectItem>
                      <SelectItem value="border-box">Border Box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
};
