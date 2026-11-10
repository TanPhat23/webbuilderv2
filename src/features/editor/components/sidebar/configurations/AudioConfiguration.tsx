import { isExternalMedia } from "./_shared/externalUrl";

import React, { ChangeEvent } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
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
  MediaPlaybackSection,
} from "./_shared";
import { cn } from "@/lib/utils";
import {
  Volume2,
  Settings2,
} from "lucide-react";

export default function AudioConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Audio") {
    return null;
  }

  const element = selectedElement as AudioElement;
  const settings: AudioSettings = element.settings ?? {};
  const src = element.src ?? "";

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

  const hasSrc = src.length > 0;
  const isExternalUrl =
    hasSrc && isExternalMedia(src);

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
          <MediaPlaybackSection
            mediaType="Audio"
            settings={settings}
            updateSetting={updateSetting}
          />
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
}
