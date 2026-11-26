import React, { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AccordionSection,
  SectionDivider,
} from "./AccordionSection";
import { ConfigField } from "./ConfigField";
import {
  Play,
  Volume2,
  VolumeX,
  Repeat,
  Loader,
} from "lucide-react";

export const PRELOAD_OPTIONS = [
  { value: "auto", label: "Auto", description: "Browser decides what to preload" },
  {
    value: "metadata",
    label: "Metadata",
    description: "Only load duration & metadata",
  },
  { value: "none", label: "None", description: "Don't preload anything" },
] as const;

export type PreloadOptionValue = (typeof PRELOAD_OPTIONS)[number]["value"];

export function resolveControlsValue(
  _mediaType: "Audio" | "Video",
  controls?: boolean,
): boolean {
  return controls !== false;
}

export interface SharedMediaPlaybackSettings {
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: PreloadOptionValue;
}

export interface MediaPlaybackSectionProps<
  TSettings extends SharedMediaPlaybackSettings = SharedMediaPlaybackSettings,
> {
  mediaType: "Audio" | "Video";
  settings: TSettings;
  updateSetting: <K extends keyof TSettings>(key: K, value: TSettings[K]) => void;
  extraPlaybackFields?: ReactNode;
}

export function MediaPlaybackSection<
  TSettings extends SharedMediaPlaybackSettings,
>({
  mediaType,
  settings,
  updateSetting,
  extraPlaybackFields,
}: MediaPlaybackSectionProps<TSettings>) {
  const idPrefix = mediaType.toLowerCase();
  const controlsValue = resolveControlsValue(mediaType, settings.controls);

  const controlsHint =
    mediaType === "Audio"
      ? "Show native audio playback controls (play, pause, volume, seek). Strongly recommended — without controls users can't interact with the player."
      : "Show native video playback controls (play, pause, volume, seek).";

  const autoplayHint =
    mediaType === "Audio"
      ? "Start playing automatically when the page loads. Most browsers block autoplay with audio unless the user has interacted with the page."
      : "Start playing automatically when the page loads. Most browsers require muted to be enabled for autoplay.";

  const loopHint =
    mediaType === "Audio"
      ? "Restart the audio automatically when it reaches the end."
      : "Restart the video automatically when it reaches the end.";

  const mutedHint =
    mediaType === "Audio"
      ? "Start the audio with sound muted. Required by most browsers for autoplay to work."
      : "Start the video with audio muted. Required by most browsers for autoplay.";

  const preloadHint =
    mediaType === "Audio"
      ? "How much of the audio to preload when the page loads. 'Metadata' is a good balance between performance and UX."
      : "How much of the video to preload. 'Metadata' is a good balance between performance and UX.";

  return (
    <AccordionSection
      value="playback"
      title="Playback"
      icon={<Play />}
      nested
    >
      {/* Controls */}
      <ConfigField
        label="Controls"
        htmlFor={`${idPrefix}-controls`}
        hint={controlsHint}
      >
        <Switch
          id={`${idPrefix}-controls`}
          checked={controlsValue}
          onCheckedChange={(checked) =>
            updateSetting("controls" as keyof TSettings, !!checked as TSettings[keyof TSettings])
          }
          className="scale-75 origin-right"
        />
      </ConfigField>

      {/* Autoplay */}
      <ConfigField
        label="Autoplay"
        htmlFor={`${idPrefix}-autoplay`}
        hint={autoplayHint}
      >
        <Switch
          id={`${idPrefix}-autoplay`}
          checked={!!settings.autoplay}
          onCheckedChange={(checked) =>
            updateSetting("autoplay" as keyof TSettings, !!checked as TSettings[keyof TSettings])
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
        htmlFor={`${idPrefix}-loop`}
        hint={loopHint}
      >
        <Switch
          id={`${idPrefix}-loop`}
          checked={!!settings.loop}
          onCheckedChange={(checked) =>
            updateSetting("loop" as keyof TSettings, !!checked as TSettings[keyof TSettings])
          }
          className="scale-75 origin-right"
        />
      </ConfigField>

      {/* Muted */}
      <ConfigField
        label="Muted"
        htmlFor={`${idPrefix}-muted`}
        hint={mutedHint}
      >
        <Switch
          id={`${idPrefix}-muted`}
          checked={!!settings.muted}
          onCheckedChange={(checked) =>
            updateSetting("muted" as keyof TSettings, !!checked as TSettings[keyof TSettings])
          }
          className="scale-75 origin-right"
        />
      </ConfigField>

      {/* Extra fields (e.g. playsInline for Video) */}
      {extraPlaybackFields}

      <SectionDivider />

      {/* Preload */}
      <ConfigField
        label="Preload"
        htmlFor={`${idPrefix}-preload`}
        hint={preloadHint}
      >
        <Select
          value={settings.preload ?? "metadata"}
          onValueChange={(value) =>
            updateSetting(
              "preload" as keyof TSettings,
              value as TSettings[keyof TSettings],
            )
          }
        >
          <SelectTrigger
            id={`${idPrefix}-preload`}
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
            {mediaType === "Audio" ? "audio on" : "audio"}
          </span>
        )}
        {controlsValue && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            controls
          </span>
        )}
      </div>
    </AccordionSection>
  );
}
