"use client";

import React, { ChangeEvent } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import {
  VideoElement,
  VideoSettings,
} from "@/interfaces/elements.interface";
import {
  AccordionSection,
  ConfigField,
  ConfigSection,
  SectionDivider,
} from "./_shared";
import { cn } from "@/lib/utils";
import {
  Video,
  Play,
  Settings2,
  Image as ImageIcon,
  Maximize,
  Volume2,
  VolumeX,
  Repeat,
  Loader,
  Monitor,
} from "lucide-react";

/* ─── Object Fit Options ─── */

const OBJECT_FIT_OPTIONS = [
  { value: "cover", label: "Cover", description: "Fill & crop to fit" },
  { value: "contain", label: "Contain", description: "Fit within bounds" },
  { value: "fill", label: "Fill", description: "Stretch to fill" },
  { value: "none", label: "None", description: "Original size" },
  {
    value: "scale-down",
    label: "Scale Down",
    description: "Smaller of none or contain",
  },
] as const;

const PRELOAD_OPTIONS = [
  { value: "auto", label: "Auto", description: "Browser decides" },
  {
    value: "metadata",
    label: "Metadata",
    description: "Only load metadata & dimensions",
  },
  { value: "none", label: "None", description: "Don't preload anything" },
] as const;

/* ─── Main Component ─── */

export default function VideoConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Video") {
    return null;
  }

  const element = selectedElement as VideoElement;
  const settings: VideoSettings = element.settings ?? {};
  const src = element.src ?? "";

  /* ─── Handlers ─── */

  const handleSrcChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateElement(selectedElement.id, { src: e.target.value });
  };

  const updateSetting = <K extends keyof VideoSettings>(
    key: K,
    value: VideoSettings[K],
  ) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [key]: value },
    });
  };

  const handleNumberInput = (
    name: keyof VideoSettings,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = e.target.value;
    const parsed = parseInt(raw, 10);
    updateSetting(name, isNaN(parsed) ? undefined : parsed);
  };

  /* ─── Derived State ─── */

  const hasSrc = src.length > 0;
  const isExternalUrl =
    hasSrc && (src.startsWith("http://") || src.startsWith("https://"));

  return (
    <AccordionItem value="video-settings" className="border-border/40">
      <AccordionTrigger
        className={cn(
          "group/trigger gap-2 py-2 hover:no-underline",
          "transition-colors duration-150",
          "hover:bg-muted/30 rounded-md px-1.5 -mx-1.5",
          "text-xs font-semibold text-foreground/90",
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150">
            <Video className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">Video Settings</span>
          {hasSrc && (
            <span className="ml-auto mr-1 shrink-0">
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-mono text-emerald-600 dark:text-emerald-400">
                src
              </span>
            </span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-3 pt-1 px-0.5">
        <Accordion
          type="multiple"
          defaultValue={["source", "playback", "display"]}
          className="w-full"
        >
          {/* ── Source ── */}
          <AccordionSection
            value="source"
            title="Source"
            icon={<Settings2 />}
            nested
          >
            {/* Video URL */}
            <ConfigField
              label="Source URL"
              htmlFor="video-src"
              hint="URL of the video file. Supports MP4, WebM, and OGG formats."
              vertical
            >
              <Input
                id="video-src"
                type="text"
                value={src}
                onChange={handleSrcChange}
                placeholder="https://example.com/video.mp4"
                className="h-7 w-full px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {/* URL indicator */}
            {hasSrc && (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    isExternalUrl
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  {isExternalUrl ? "External source" : "Local source"}
                </span>
              </div>
            )}

            <SectionDivider />

            {/* Poster */}
            <ConfigField
              label="Poster"
              htmlFor="video-poster"
              hint="Image URL displayed before the video plays. Acts as a thumbnail preview."
              vertical
            >
              <Input
                id="video-poster"
                type="text"
                value={settings.poster ?? ""}
                onChange={(e) => updateSetting("poster", e.target.value || undefined)}
                placeholder="https://example.com/poster.jpg"
                className="h-7 w-full px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {settings.poster && (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                <ImageIcon className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/50">
                  Poster image set
                </span>
              </div>
            )}
          </AccordionSection>

          {/* ── Playback ── */}
          <AccordionSection
            value="playback"
            title="Playback"
            icon={<Play />}
            nested
          >
            {/* Controls */}
            <ConfigField
              label="Controls"
              htmlFor="video-controls"
              hint="Show native video playback controls (play, pause, volume, seek)."
            >
              <Switch
                id="video-controls"
                checked={settings.controls !== false}
                onCheckedChange={(checked) =>
                  updateSetting("controls", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Autoplay */}
            <ConfigField
              label="Autoplay"
              htmlFor="video-autoplay"
              hint="Start playing automatically when the page loads. Most browsers require muted to be enabled for autoplay."
            >
              <Switch
                id="video-autoplay"
                checked={!!settings.autoplay}
                onCheckedChange={(checked) =>
                  updateSetting("autoplay", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Autoplay + muted hint */}
            {settings.autoplay && !settings.muted && (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                <VolumeX className="h-3 w-3 text-amber-500/60" />
                <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60 leading-tight">
                  Autoplay may be blocked — enable Muted for reliable autoplay
                </span>
              </div>
            )}

            {/* Loop */}
            <ConfigField
              label="Loop"
              htmlFor="video-loop"
              hint="Restart the video automatically when it reaches the end."
            >
              <Switch
                id="video-loop"
                checked={!!settings.loop}
                onCheckedChange={(checked) =>
                  updateSetting("loop", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Muted */}
            <ConfigField
              label="Muted"
              htmlFor="video-muted"
              hint="Start the video with audio muted. Required by most browsers for autoplay."
            >
              <Switch
                id="video-muted"
                checked={!!settings.muted}
                onCheckedChange={(checked) =>
                  updateSetting("muted", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Plays Inline */}
            <ConfigField
              label="Plays inline"
              htmlFor="video-playsInline"
              hint="Play the video inline on mobile instead of fullscreen. Important for iOS Safari."
            >
              <Switch
                id="video-playsInline"
                checked={!!settings.playsInline}
                onCheckedChange={(checked) =>
                  updateSetting("playsInline", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            <SectionDivider />

            {/* Preload */}
            <ConfigField
              label="Preload"
              htmlFor="video-preload"
              hint="How much of the video to preload. 'Metadata' is a good balance between performance and UX."
            >
              <Select
                value={settings.preload ?? "metadata"}
                onValueChange={(value) =>
                  updateSetting(
                    "preload",
                    value as VideoSettings["preload"],
                  )
                }
              >
                <SelectTrigger
                  id="video-preload"
                  className="h-7 w-[110px] px-2 text-[11px] rounded-md"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRELOAD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex flex-col">
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ConfigField>

            {/* Preload info */}
            <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
              <Loader className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/50">
                {
                  PRELOAD_OPTIONS.find(
                    (o) => o.value === (settings.preload ?? "metadata"),
                  )?.description
                }
              </span>
            </div>

            {/* Playback summary */}
            <SectionDivider />
            <div className="flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150">
              {settings.autoplay && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  <Play className="h-2.5 w-2.5" />
                  autoplay
                </span>
              )}
              {settings.loop && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  <Repeat className="h-2.5 w-2.5" />
                  loop
                </span>
              )}
              {settings.muted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  <VolumeX className="h-2.5 w-2.5" />
                  muted
                </span>
              )}
              {!settings.muted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  <Volume2 className="h-2.5 w-2.5" />
                  audio
                </span>
              )}
            </div>
          </AccordionSection>

          {/* ── Display ── */}
          <AccordionSection
            value="display"
            title="Display"
            icon={<Monitor />}
            nested
          >
            {/* Object Fit */}
            <ConfigField
              label="Object fit"
              htmlFor="video-objectFit"
              hint="How the video is resized to fit its container."
            >
              <Select
                value={settings.objectFit ?? "cover"}
                onValueChange={(value) =>
                  updateSetting(
                    "objectFit",
                    value as VideoSettings["objectFit"],
                  )
                }
              >
                <SelectTrigger
                  id="video-objectFit"
                  className="h-7 w-[110px] px-2 text-[11px] rounded-md"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OBJECT_FIT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ConfigField>

            {/* Object fit description */}
            <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
              <Maximize className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/50">
                {
                  OBJECT_FIT_OPTIONS.find(
                    (o) => o.value === (settings.objectFit ?? "cover"),
                  )?.description
                }
              </span>
            </div>

            <SectionDivider />

            {/* Width */}
            <ConfigField
              label="Width"
              htmlFor="video-width"
              hint="Intrinsic width in pixels. The element can still be resized via CSS."
            >
              <div className="flex items-center gap-1">
                <Input
                  id="video-width"
                  type="number"
                  value={settings.width ?? ""}
                  onChange={(e) => handleNumberInput("width", e)}
                  placeholder="auto"
                  min={0}
                  className="h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                />
                <span className="text-[10px] text-muted-foreground/60 font-medium select-none">
                  px
                </span>
              </div>
            </ConfigField>

            {/* Height */}
            <ConfigField
              label="Height"
              htmlFor="video-height"
              hint="Intrinsic height in pixels. The element can still be resized via CSS."
            >
              <div className="flex items-center gap-1">
                <Input
                  id="video-height"
                  type="number"
                  value={settings.height ?? ""}
                  onChange={(e) => handleNumberInput("height", e)}
                  placeholder="auto"
                  min={0}
                  className="h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                />
                <span className="text-[10px] text-muted-foreground/60 font-medium select-none">
                  px
                </span>
              </div>
            </ConfigField>

            {/* Dimensions summary */}
            {(settings.width || settings.height) && (
              <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
                <Monitor className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/50 font-mono">
                  {settings.width ?? "auto"} × {settings.height ?? "auto"}
                </span>
              </div>
            )}
          </AccordionSection>
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
}
