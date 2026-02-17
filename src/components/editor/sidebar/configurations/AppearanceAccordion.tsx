"use client";

import { Accordion } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import React from "react";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import { cn } from "@/lib/utils";
import { ResponsiveStyles } from "@/interfaces/elements.interface";
import {
  AccordionSection,
  ColorPickerField,
  SliderField,
  SpacingGroup,
  ConfigField,
  BG_COLOR_PRESETS,
  TEXT_COLOR_PRESETS,
  BORDER_COLOR_PRESETS,
  SectionDivider,
  PositionSection,
  DisplaySection,
} from "./_shared";
import {
  Paintbrush,
  Ruler,
  Palette,
  Square,
  BoxSelect,
  SunDim,
  Box,
  LayoutGrid,
  MapPin,
  Image as ImageIcon,
  Move3D,
  Sparkles,
  Layers,
} from "lucide-react";

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
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  const responsiveStyles: ResponsiveStyles = selectedElement?.styles ?? {};
  const styles: AppearanceStyles = responsiveStyles[currentBreakpoint] ?? {};
  const updateStyle = <K extends keyof AppearanceStyles>(
    property: K,
    value: AppearanceStyles[K],
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

  const batchUpdateStyle = (partial: Partial<AppearanceStyles>) => {
    if (!selectedElement) return;
    const newStyles = { ...styles, ...partial };

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

  return (
    <AccordionSection
      value="appearance"
      title="Appearance"
      icon={<Paintbrush />}
    >
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
          "display",
          "position",
          "background",
          "transform",
          "effects",
          "overflow",
        ]}
        className="w-full flex flex-col gap-0.5"
      >
        {/* Size Section */}
        <AccordionSection value="size" title="Size" icon={<Ruler />} nested>
          <ConfigField
            label="Width"
            hint="Element width — use px, %, auto, etc."
          >
            <Input
              value={styles.width || "auto"}
              onChange={(e) => updateStyle("width", e.target.value)}
              className="h-7 w-[90px] px-1.5 text-[11px] font-mono rounded-md text-center"
            />
          </ConfigField>
          <ConfigField
            label="Height"
            hint="Element height — use px, %, auto, etc."
          >
            <Input
              value={styles.height || "auto"}
              onChange={(e) => updateStyle("height", e.target.value)}
              className="h-7 w-[90px] px-1.5 text-[11px] font-mono rounded-md text-center"
            />
          </ConfigField>
        </AccordionSection>
        {/* Colors Section */}
        <AccordionSection
          value="colors"
          title="Colors"
          icon={<Palette />}
          nested
        >
          <ColorPickerField
            label="Background"
            hint="Background color of the element"
            value={styles.backgroundColor}
            onChange={(color) => updateStyle("backgroundColor", color)}
            presets={BG_COLOR_PRESETS}
          />
          <ColorPickerField
            label="Text"
            hint="Text / foreground color"
            value={styles.color}
            onChange={(color) => updateStyle("color", color)}
            presets={TEXT_COLOR_PRESETS}
          />
        </AccordionSection>

        {/* Border Section */}
        <AccordionSection
          value="border"
          title="Border"
          icon={<Square />}
          nested
        >
          <ColorPickerField
            label="Color"
            hint="Border color"
            value={styles.borderColor}
            onChange={(color) => updateStyle("borderColor", color)}
            presets={BORDER_COLOR_PRESETS}
          />
          <SliderField
            label="Width"
            id="borderWidth"
            hint="Border thickness in pixels"
            value={
              typeof styles.borderWidth === "number" ? styles.borderWidth : 0
            }
            onChange={(val) =>
              updateStyle(
                "borderWidth",
                typeof val === "number" ? val : parseInt(String(val)) || 0,
              )
            }
            min={0}
            max={20}
            step={1}
            unit="px"
            rawNumber
          />
          <ConfigField label="Style" hint="Border line style">
            <Select
              value={styles.borderStyle || "solid"}
              onValueChange={(value) => updateStyle("borderStyle", value)}
            >
              <SelectTrigger className="h-7 w-[100px] px-2 text-[11px] rounded-md">
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
          </ConfigField>
          <SliderField
            label="Radius"
            id="borderRadius"
            hint="Corner rounding in pixels"
            value={
              typeof styles.borderRadius === "number" ? styles.borderRadius : 0
            }
            onChange={(val) =>
              updateStyle(
                "borderRadius",
                typeof val === "number" ? val : parseInt(String(val)) || 0,
              )
            }
            min={0}
            max={100}
            step={1}
            unit="px"
            rawNumber
          />
          <SectionDivider />
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            <ConfigField label="TL" htmlFor="borderTopLeftRadius">
              <Input
                id="borderTopLeftRadius"
                type="number"
                value={styles.borderTopLeftRadius || ""}
                onChange={(e) =>
                  updateStyle("borderTopLeftRadius", `${e.target.value}px`)
                }
                className="h-6 w-[48px] px-1 text-[11px] font-mono tabular-nums text-center rounded-md"
                placeholder="0"
              />
            </ConfigField>
            <ConfigField label="TR" htmlFor="borderTopRightRadius">
              <Input
                id="borderTopRightRadius"
                type="number"
                value={styles.borderTopRightRadius || ""}
                onChange={(e) =>
                  updateStyle("borderTopRightRadius", `${e.target.value}px`)
                }
                className="h-6 w-[48px] px-1 text-[11px] font-mono tabular-nums text-center rounded-md"
                placeholder="0"
              />
            </ConfigField>
            <ConfigField label="BL" htmlFor="borderBottomLeftRadius">
              <Input
                id="borderBottomLeftRadius"
                type="number"
                value={styles.borderBottomLeftRadius || ""}
                onChange={(e) =>
                  updateStyle("borderBottomLeftRadius", `${e.target.value}px`)
                }
                className="h-6 w-[48px] px-1 text-[11px] font-mono tabular-nums text-center rounded-md"
                placeholder="0"
              />
            </ConfigField>
            <ConfigField label="BR" htmlFor="borderBottomRightRadius">
              <Input
                id="borderBottomRightRadius"
                type="number"
                value={styles.borderBottomRightRadius || ""}
                onChange={(e) =>
                  updateStyle("borderBottomRightRadius", `${e.target.value}px`)
                }
                className="h-6 w-[48px] px-1 text-[11px] font-mono tabular-nums text-center rounded-md"
                placeholder="0"
              />
            </ConfigField>
          </div>
        </AccordionSection>

        {/* Box Shadow Section */}
        <AccordionSection
          value="box-shadow"
          title="Box Shadow"
          icon={<BoxSelect />}
          nested
        >
          <ConfigField
            label="Shadow"
            hint="Box shadow preset from your theme tokens"
          >
            <Select
              value={styles.boxShadow ? styles.boxShadow : "none"}
              onValueChange={(value) =>
                updateStyle("boxShadow", value === "none" ? undefined : value)
              }
            >
              <SelectTrigger className="h-7 w-[100px] px-2 text-[11px] rounded-md">
                <SelectValue placeholder="None" />
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
          </ConfigField>
        </AccordionSection>

        {/* Opacity Section */}
        <AccordionSection
          value="opacity"
          title="Opacity"
          icon={<SunDim />}
          nested
        >
          <SliderField
            label="Opacity"
            id="opacity"
            hint="Element transparency — 0 is fully transparent, 100 is fully opaque"
            value={
              typeof styles.opacity === "number"
                ? Math.round(styles.opacity * 100)
                : 100
            }
            onChange={(val) =>
              updateStyle(
                "opacity",
                (typeof val === "number" ? val : parseInt(String(val)) || 100) /
                  100,
              )
            }
            min={0}
            max={100}
            step={1}
            unit="%"
            rawNumber
          />
        </AccordionSection>

        {/* Padding Section */}
        <AccordionSection value="padding" title="Padding" icon={<Box />} nested>
          <SpacingGroup
            label="Padding"
            values={{
              top: styles.paddingTop,
              right: styles.paddingRight,
              bottom: styles.paddingBottom,
              left: styles.paddingLeft,
            }}
            onChange={(dir, val) => {
              const key =
                `padding${dir.charAt(0).toUpperCase() + dir.slice(1)}` as keyof AppearanceStyles;
              updateStyle(key, val);
            }}
          />
        </AccordionSection>

        {/* Margin Section */}
        <AccordionSection value="margin" title="Margin" icon={<Box />} nested>
          <SpacingGroup
            label="Margin"
            values={{
              top: styles.marginTop,
              right: styles.marginRight,
              bottom: styles.marginBottom,
              left: styles.marginLeft,
            }}
            onChange={(dir, val) => {
              const key =
                `margin${dir.charAt(0).toUpperCase() + dir.slice(1)}` as keyof AppearanceStyles;
              updateStyle(key, val);
            }}
          />
        </AccordionSection>

        {/* Display & Layout Section (Figma-inspired) */}
        <AccordionSection
          value="display"
          title="Auto layout"
          icon={<LayoutGrid />}
          nested
        >
          <DisplaySection
            styles={styles}
            updateStyle={updateStyle}
            batchUpdateStyle={batchUpdateStyle}
          />
        </AccordionSection>

        {/* Position Section (Figma-inspired) */}
        <AccordionSection
          value="position"
          title="Position"
          icon={<MapPin />}
          nested
        >
          <PositionSection
            styles={styles}
            updateStyle={(property, value) =>
              updateStyle(
                property as keyof AppearanceStyles,
                value as AppearanceStyles[keyof AppearanceStyles],
              )
            }
          />
        </AccordionSection>

        {/* Background Section */}
        <AccordionSection
          value="background"
          title="Background"
          icon={<ImageIcon />}
          nested
        >
          <ConfigField
            label="Image URL"
            htmlFor="backgroundImage"
            hint="CSS background-image value"
            vertical
          >
            <Input
              id="backgroundImage"
              type="text"
              value={styles.backgroundImage || ""}
              placeholder="url(https://...)"
              onChange={(e) => updateStyle("backgroundImage", e.target.value)}
              className="h-7 w-full px-1.5 text-[11px] font-mono rounded-md"
            />
          </ConfigField>
          <ConfigField label="Size" hint="Background sizing mode">
            <Select
              value={styles.backgroundSize?.toString() || "auto"}
              onValueChange={(value) => updateStyle("backgroundSize", value)}
            >
              <SelectTrigger className="h-7 w-[100px] px-2 text-[11px] rounded-md">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="cover">Cover</SelectItem>
                <SelectItem value="contain">Contain</SelectItem>
                <SelectItem value="100% 100%">100%</SelectItem>
              </SelectContent>
            </Select>
          </ConfigField>
          <ConfigField
            label="Position"
            htmlFor="backgroundPosition"
            hint="Background position (e.g. center center)"
          >
            <Input
              id="backgroundPosition"
              type="text"
              value={styles.backgroundPosition || ""}
              placeholder="center center"
              onChange={(e) =>
                updateStyle("backgroundPosition", e.target.value)
              }
              className="h-7 w-[110px] px-1.5 text-[11px] font-mono rounded-md"
            />
          </ConfigField>
          <ConfigField label="Repeat" hint="Background repeat behavior">
            <Select
              value={styles.backgroundRepeat || "repeat"}
              onValueChange={(value) => updateStyle("backgroundRepeat", value)}
            >
              <SelectTrigger className="h-7 w-[100px] px-2 text-[11px] rounded-md">
                <SelectValue placeholder="Repeat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="repeat">Repeat</SelectItem>
                <SelectItem value="no-repeat">No Repeat</SelectItem>
                <SelectItem value="repeat-x">Repeat X</SelectItem>
                <SelectItem value="repeat-y">Repeat Y</SelectItem>
              </SelectContent>
            </Select>
          </ConfigField>
        </AccordionSection>

        {/* Transform Section */}
        <AccordionSection
          value="transform"
          title="Transform"
          icon={<Move3D />}
          nested
        >
          <ConfigField
            label="Transform"
            htmlFor="transform"
            hint="CSS transform (e.g. rotate(45deg) scale(1.2))"
            vertical
          >
            <Input
              id="transform"
              type="text"
              value={styles.transform || ""}
              placeholder="rotate(45deg) scale(1.2)"
              onChange={(e) => updateStyle("transform", e.target.value)}
              className="h-7 w-full px-1.5 text-[11px] font-mono rounded-md"
            />
          </ConfigField>
          <ConfigField
            label="Origin"
            htmlFor="transformOrigin"
            hint="Transform origin point"
          >
            <Input
              id="transformOrigin"
              type="text"
              value={styles.transformOrigin || ""}
              placeholder="center center"
              onChange={(e) => updateStyle("transformOrigin", e.target.value)}
              className="h-7 w-[110px] px-1.5 text-[11px] font-mono rounded-md"
            />
          </ConfigField>
        </AccordionSection>

        {/* Effects Section */}
        <AccordionSection
          value="effects"
          title="Effects"
          icon={<Sparkles />}
          nested
        >
          <ConfigField
            label="Filter"
            htmlFor="filter"
            hint="CSS filter (blur, brightness, contrast, etc.)"
            vertical
          >
            <Input
              id="filter"
              type="text"
              value={styles.filter || ""}
              placeholder="blur(5px) brightness(1.2)"
              onChange={(e) => updateStyle("filter", e.target.value)}
              className="h-7 w-full px-1.5 text-[11px] font-mono rounded-md"
            />
          </ConfigField>
          <ConfigField label="Cursor" hint="Mouse cursor style on hover">
            <Select
              value={styles.cursor || "auto"}
              onValueChange={(value) => updateStyle("cursor", value)}
            >
              <SelectTrigger className="h-7 w-[100px] px-2 text-[11px] rounded-md">
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
          </ConfigField>
          <ConfigField
            label="Visibility"
            hint="Controls element visibility without removing it from layout"
          >
            <Select
              value={styles.visibility || "visible"}
              onValueChange={(value) =>
                updateStyle(
                  "visibility",
                  value as "visible" | "hidden" | "collapse",
                )
              }
            >
              <SelectTrigger className="h-7 w-[100px] px-2 text-[11px] rounded-md">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="collapse">Collapse</SelectItem>
              </SelectContent>
            </Select>
          </ConfigField>
        </AccordionSection>

        {/* Overflow Section */}
        <AccordionSection
          value="overflow"
          title="Overflow"
          icon={<Layers />}
          nested
        >
          <ConfigField
            label="Overflow"
            hint="How content that overflows the element is handled"
          >
            <Select
              value={styles.overflow || "visible"}
              onValueChange={(value) =>
                updateStyle(
                  "overflow",
                  value as "visible" | "hidden" | "scroll" | "auto",
                )
              }
            >
              <SelectTrigger className="h-7 w-[100px] px-2 text-[11px] rounded-md">
                <SelectValue placeholder="Overflow" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="scroll">Scroll</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </ConfigField>
          <ConfigField label="Overflow X" hint="Horizontal overflow behavior">
            <Select
              value={styles.overflowX || "visible"}
              onValueChange={(value) =>
                updateStyle(
                  "overflowX",
                  value as "visible" | "hidden" | "scroll" | "auto",
                )
              }
            >
              <SelectTrigger className="h-7 w-[100px] px-2 text-[11px] rounded-md">
                <SelectValue placeholder="X" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="scroll">Scroll</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </ConfigField>
          <ConfigField label="Overflow Y" hint="Vertical overflow behavior">
            <Select
              value={styles.overflowY || "visible"}
              onValueChange={(value) =>
                updateStyle(
                  "overflowY",
                  value as "visible" | "hidden" | "scroll" | "auto",
                )
              }
            >
              <SelectTrigger className="h-7 w-[100px] px-2 text-[11px] rounded-md">
                <SelectValue placeholder="Y" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="scroll">Scroll</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </ConfigField>
          <SectionDivider />
          <ConfigField
            label="Box Sizing"
            hint="Whether padding and border are included in the element's total width and height"
          >
            <Select
              value={styles.boxSizing || "content-box"}
              onValueChange={(value) =>
                updateStyle("boxSizing", value as "content-box" | "border-box")
              }
            >
              <SelectTrigger className="h-7 w-[110px] px-2 text-[11px] rounded-md">
                <SelectValue placeholder="Box Sizing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="content-box">Content Box</SelectItem>
                <SelectItem value="border-box">Border Box</SelectItem>
              </SelectContent>
            </Select>
          </ConfigField>
        </AccordionSection>
      </Accordion>
    </AccordionSection>
  );
};
