"use client";

import React from "react";
import { Accordion } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import {
  CarouselElement,
  CarouselSettings,
} from "@/interfaces/elements.interface";
import {
  AccordionSection,
  ConfigField,
  ConfigSection,
  SectionDivider,
} from "./_shared";
import {
  GalleryHorizontal,
  Play,
  Layers,
  MonitorSmartphone,
  Navigation,
  Repeat,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  Timer,
  LayoutGrid,
  Hash,
} from "lucide-react";
import {
  ToggleGroupField,
  type ToggleOption,
} from "./_shared/ToggleGroupField";

/* ─── Alignment Options ─── */

const ALIGN_OPTIONS: ToggleOption[] = [
  {
    value: "start",
    label: "Start",
    icon: <AlignHorizontalJustifyStart className="h-3.5 w-3.5" />,
  },
  {
    value: "center",
    label: "Center",
    icon: <AlignHorizontalJustifyCenter className="h-3.5 w-3.5" />,
  },
  {
    value: "end",
    label: "End",
    icon: <AlignHorizontalJustifyEnd className="h-3.5 w-3.5" />,
  },
];

/* ─── Main Component ─── */

export default function CarouselConfigurationAccordion() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Carousel") {
    return null;
  }

  const settings = (selectedElement as CarouselElement).settings || {};

  /* ─── Handlers ─── */

  const updateSetting = <K extends keyof CarouselSettings>(
    name: K,
    value: CarouselSettings[K],
  ) => {
    updateElement(selectedElement.id, {
      settings: {
        ...settings,
        [name]: value,
      },
    });
  };

  const handleNumberInput = (
    name: keyof CarouselSettings,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = e.target.value;
    const parsed = parseInt(raw, 10);
    updateSetting(name, isNaN(parsed) ? 0 : parsed);
  };

  return (
    <AccordionSection
      value="carousel-settings"
      title="Carousel"
      icon={<GalleryHorizontal />}
    >
      <Accordion
        type="multiple"
        defaultValue={["general", "autoplay", "slides"]}
        className="w-full"
      >
        {/* ── General ── */}
        <AccordionSection
          value="general"
          title="General"
          icon={<Navigation />}
          nested
        >
          <ConfigField
            label="Loop"
            htmlFor="carousel-loop"
            hint="Continuously loop through slides when reaching the end"
          >
            <Switch
              id="carousel-loop"
              checked={!!settings.loop}
              onCheckedChange={(checked) => updateSetting("loop", !!checked)}
              className="scale-75 origin-right"
            />
          </ConfigField>

          <ConfigField
            label="Navigation"
            htmlFor="carousel-navigation"
            hint="Show previous/next navigation arrows"
          >
            <Switch
              id="carousel-navigation"
              checked={
                settings.withNavigation !== undefined
                  ? settings.withNavigation
                  : true
              }
              onCheckedChange={(checked) =>
                updateSetting("withNavigation", !!checked)
              }
              className="scale-75 origin-right"
            />
          </ConfigField>

          <ToggleGroupField
            label="Align"
            hint="Alignment of slides within the carousel viewport"
            value={(settings.align as string) || "start"}
            onChange={(value) =>
              updateSetting(
                "align",
                (value ?? "start") as CarouselSettings["align"],
              )
            }
            options={ALIGN_OPTIONS}
          />
        </AccordionSection>

        {/* ── Autoplay ── */}
        <AccordionSection
          value="autoplay"
          title="Autoplay"
          icon={<Play />}
          nested
        >
          <ConfigField
            label="Enable"
            htmlFor="carousel-autoplay"
            hint="Automatically advance slides at a set interval"
          >
            <Switch
              id="carousel-autoplay"
              checked={!!settings.autoplay}
              onCheckedChange={(checked) =>
                updateSetting("autoplay", !!checked)
              }
              className="scale-75 origin-right"
            />
          </ConfigField>

          {settings.autoplay && (
            <ConfigField
              label="Speed"
              htmlFor="carousel-autoplay-speed"
              hint="Time between slide transitions in milliseconds"
            >
              <div className="flex items-center gap-1">
                <Input
                  id="carousel-autoplay-speed"
                  type="number"
                  value={settings.autoplaySpeed || 3000}
                  onChange={(e) => handleNumberInput("autoplaySpeed", e)}
                  min={500}
                  step={100}
                  className="h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums rounded-md"
                  autoComplete="off"
                />
                <span className="text-[10px] text-muted-foreground/60 font-medium select-none">
                  ms
                </span>
              </div>
            </ConfigField>
          )}

          {settings.autoplay && (
            <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150">
              <Timer className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/50">
                Advances every{" "}
                <span className="font-mono tabular-nums font-medium text-muted-foreground/70">
                  {((settings.autoplaySpeed || 3000) / 1000).toFixed(1)}s
                </span>
              </span>
            </div>
          )}
        </AccordionSection>

        {/* ── Slides ── */}
        <AccordionSection
          value="slides"
          title="Slides"
          icon={<Layers />}
          nested
        >
          <ConfigField
            label="Show"
            htmlFor="carousel-slidesToShow"
            hint="Number of slides visible at once"
          >
            <Input
              id="carousel-slidesToShow"
              type="number"
              value={settings.slidesToShow || 1}
              onChange={(e) => handleNumberInput("slidesToShow", e)}
              min={1}
              max={10}
              className="h-7 w-[56px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
            />
          </ConfigField>

          <ConfigField
            label="Scroll"
            htmlFor="carousel-slidesToScroll"
            hint="Number of slides to advance per interaction"
          >
            <Input
              id="carousel-slidesToScroll"
              type="number"
              value={settings.slidesToScroll || 1}
              onChange={(e) => handleNumberInput("slidesToScroll", e)}
              min={1}
              max={10}
              className="h-7 w-[56px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
            />
          </ConfigField>

          {/* Visual summary */}
          <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
            <LayoutGrid className="h-3 w-3 text-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground/50">
              Showing{" "}
              <span className="font-mono tabular-nums font-medium text-muted-foreground/70">
                {settings.slidesToShow || 1}
              </span>
              , scrolling{" "}
              <span className="font-mono tabular-nums font-medium text-muted-foreground/70">
                {settings.slidesToScroll || 1}
              </span>{" "}
              at a time
            </span>
          </div>
        </AccordionSection>

        {/* ── Responsive ── */}
        <AccordionSection
          value="responsive"
          title="Responsive"
          icon={<MonitorSmartphone />}
          nested
        >
          <ConfigSection>
            <ConfigField
              label="Breakpoints"
              hint="JSON breakpoint configuration for responsive slide counts"
              vertical
            >
              <Input
                type="text"
                value={
                  settings.breakpoints
                    ? JSON.stringify(settings.breakpoints)
                    : ""
                }
                onChange={(e) => {
                  try {
                    const parsed = e.target.value
                      ? JSON.parse(e.target.value)
                      : undefined;
                    updateSetting("breakpoints", parsed);
                  } catch {
                    // Allow partial typing — only update on valid JSON
                  }
                }}
                placeholder='{"640": {"slidesToShow": 2}}'
                className="h-7 w-full px-1.5 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            <div className="flex items-center gap-1.5 pl-0.5">
              <Hash className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/50 leading-tight">
                Define per-breakpoint overrides as JSON
              </span>
            </div>
          </ConfigSection>
        </AccordionSection>
      </Accordion>
    </AccordionSection>
  );
}
