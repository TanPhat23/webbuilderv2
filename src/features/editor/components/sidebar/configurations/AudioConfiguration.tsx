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
import { useUpdateElement } from "@/features/editor";
import { useSelectedElement } from "@/features/editor";
import {
  AudioElement,
  AudioSettings,
} from "@/features/editor";
import {
  AccordionSection,
  ConfigField,
  SectionDivider,
} from "./_shared";
import { cn } from "@/lib/utils";
import {
  Volume2,
  VolumeX,
  Play,
  Settings2,
  Repeat,
  Loader,
} from "lucide-react";

/* ─── Preload Options ─── */

const PRELOAD_OPTIONS = [
  { value: "auto", label: "Auto", description: "Browser decides what to preload" },
  {
    value: "metadata",
    label: "Metadata",
    description: "Only load duration & metadata",
  },
  { value: "none", label: "None", description: "Don't preload anything" },
] as const;

/* ─── Main Component ─── */

export default function AudioConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Audio") {
    return null;
  }

  const element = selectedElement as AudioElement;
  const settings: AudioSettings = element.settings ?? {};
  const src = element.src ?? "";

  /* ─── Handlers ─── */

  const handleSrcChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateElement(selectedElement.id, { src: e.target.value });
  };

  const updateSetting = <K extends keyof AudioSettings>(
    key: K,
    value: AudioSettings[K],
  ) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [key]: value },
    });
  };

  /* ─── Derived State ─── */

  const hasSrc = src.length > 0;
  const isExternalUrl =
    hasSrc && (src.startsWith("http://") || src.startsWith("https://"));

  return (
    <AccordionItem value="audio-settings" className="border-border/40">
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
            <Volume2 className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">Audio Settings</span>
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
          defaultValue={["source", "playback"]}
          className="w-full"
        >
          {/* ── Source ── */}
          <AccordionSection
            value="source"
            title="Source"
            icon={<Settings2 />}
            nested
          >
            {/* Audio URL */}
            <ConfigField
              label="Source URL"
              htmlFor="audio-src"
              hint="URL of the audio file. Supports MP3, WAV, OGG, and AAC formats."
              vertical
            >
              <Input
                id="audio-src"
                type="text"
                value={src}
                onChange={handleSrcChange}
                placeholder="https://example.com/audio.mp3"
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
              htmlFor="audio-controls"
              hint="Show native audio playback controls (play, pause, volume, seek). Strongly recommended — without controls users can't interact with the player."
            >
              <Switch
                id="audio-controls"
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
              htmlFor="audio-autoplay"
              hint="Start playing automatically when the page loads. Most browsers block autoplay with audio unless the user has interacted with the page."
            >
              <Switch
                id="audio-autoplay"
                checked={!!settings.autoplay}
                onCheckedChange={(checked) =>
                  updateSetting("autoplay", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Autoplay + unmuted hint */}
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
              htmlFor="audio-loop"
              hint="Restart the audio automatically when it reaches the end."
            >
              <Switch
                id="audio-loop"
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
              htmlFor="audio-muted"
              hint="Start the audio with sound muted. Required by most browsers for autoplay to work."
            >
              <Switch
                id="audio-muted"
                checked={!!settings.muted}
                onCheckedChange={(checked) =>
                  updateSetting("muted", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            <SectionDivider />

            {/* Preload */}
            <ConfigField
              label="Preload"
              htmlFor="audio-preload"
              hint="How much of the audio to preload when the page loads. 'Metadata' is a good balance between performance and UX."
            >
              <Select
                value={settings.preload ?? "metadata"}
                onValueChange={(value) =>
                  updateSetting(
                    "preload",
                    value as AudioSettings["preload"],
                  )
                }
              >
                <SelectTrigger
                  id="audio-preload"
                  className="h-7 w-[110px] px-2 text-[11px] rounded-md"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRELOAD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
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
              {settings.muted ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  <VolumeX className="h-2.5 w-2.5" />
                  muted
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  <Volume2 className="h-2.5 w-2.5" />
                  audio on
                </span>
              )}
              {settings.controls !== false && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  controls
                </span>
              )}
            </div>
          </AccordionSection>
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
}
