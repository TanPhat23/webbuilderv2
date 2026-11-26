import { useEffect, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@webbuilder/site-runtime/lib/utils";
import { Droplets, Paintbrush, PenTool, Ruler, Smile } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic.mjs";
import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_FILL,
  DEFAULT_ICON_SIZE,
  DEFAULT_ICON_STROKE_WIDTH,
  FILL_COLOR_PRESETS,
  ICON_COLOR_PRESETS,
  ICON_SIZE_PRESETS,
  ICON_STROKE_PRESETS,
  clampIconMetric,
  isValidIconName,
  type IconColorPreset,
} from "../../../lib/iconConfig";
import { ConfigField, ConfigSection, SectionDivider } from "./_shared";
import { ConfigSwitch } from "./_shared/ConfigInputs";

interface IconMetricControlProps {
  id: string;
  label: string;
  hint: string;
  placeholder: string;
  value: number;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  presets: readonly number[];
  onChange: (value: number | undefined) => void;
}

function IconMetricControl({
  id,
  label,
  hint,
  placeholder,
  value,
  defaultValue,
  min,
  max,
  step,
  presets,
  onChange,
}: IconMetricControlProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <>
      <ConfigField label={label} htmlFor={id} hint={hint}>
        <div className="flex items-center gap-1">
          <Input
            id={id}
            type="number"
            value={draft}
            onChange={(e) => {
              const raw = e.target.value;
              setDraft(raw);
              if (raw.trim() === "") return;
              const parsed = Number.parseFloat(raw);
              if (Number.isFinite(parsed) && parsed >= min && parsed <= max) {
                onChange(parsed);
              }
            }}
            onBlur={() => {
              if (draft.trim() === "") {
                setDraft(String(defaultValue));
                onChange(undefined);
                return;
              }
              const next = clampIconMetric(draft, min, max);
              setDraft(String(next ?? value));
              if (next !== undefined && next !== value) onChange(next);
            }}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className="h-7 w-[64px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
          />
          <span className="text-[10px] text-muted-foreground/60 font-medium select-none">
            px
          </span>
        </div>
      </ConfigField>

      <div className="flex items-center gap-1 pl-0.5">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums transition-all",
              value === preset
                ? "bg-primary text-primary-foreground font-medium"
                : "bg-muted/40 text-muted-foreground/60 hover:bg-muted/80 hover:text-muted-foreground",
            )}
          >
            {preset}
          </button>
        ))}
      </div>
    </>
  );
}

export function IconSizingContent({
  iconName,
  size,
  strokeWidth,
  absoluteStrokeWidth,
  color,
  fill,
  onUpdateSize,
  onUpdateStrokeWidth,
  onToggleAbsoluteStroke,
}: {
  iconName: string;
  size: number;
  strokeWidth: number;
  absoluteStrokeWidth: boolean;
  color: string;
  fill: string;
  onUpdateSize: (value: number | undefined) => void;
  onUpdateStrokeWidth: (value: number | undefined) => void;
  onToggleAbsoluteStroke: (checked: boolean) => void;
}) {
  const validName = isValidIconName(iconName) ? iconName : null;

  return (
    <>
      <IconMetricControl
        id="icon-size"
        label="Size"
        hint="The width and height of the icon in pixels. The icon scales proportionally."
        placeholder="24"
        value={size}
        defaultValue={DEFAULT_ICON_SIZE}
        min={8}
        max={512}
        step={1}
        presets={ICON_SIZE_PRESETS}
        onChange={onUpdateSize}
      />

      <SectionDivider />

      <IconMetricControl
        id="icon-strokeWidth"
        label="Stroke width"
        hint="The thickness of the icon's lines. Default is 2. Lower values create thinner icons, higher values create bolder icons."
        placeholder="2"
        value={strokeWidth}
        defaultValue={DEFAULT_ICON_STROKE_WIDTH}
        min={0.5}
        max={4}
        step={0.25}
        presets={ICON_STROKE_PRESETS}
        onChange={onUpdateStrokeWidth}
      />

      <SectionDivider />

      <ConfigSwitch
        id="icon-absoluteStrokeWidth"
        label="Absolute stroke"
        hint="When enabled, the stroke width stays constant regardless of the icon size. When disabled (default), the stroke scales proportionally with the icon."
        checked={absoluteStrokeWidth}
        onCheckedChange={onToggleAbsoluteStroke}
      />

      <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
        <PenTool className="h-3 w-3 text-muted-foreground/40" />
        <span className="text-[10px] text-muted-foreground/50 leading-tight">
          {absoluteStrokeWidth
            ? `Fixed ${strokeWidth}px stroke — consistent at any size`
            : `Proportional stroke — scales with ${size}px icon`}
        </span>
      </div>

      <SectionDivider />
      <div className="flex items-center justify-center py-2 animate-in fade-in-0 duration-150">
        <div className="flex items-center justify-center rounded-lg border border-border/40 bg-muted/10 p-3">
          {validName ? (
            <DynamicIcon
              name={validName}
              size={Math.min(size, 64)}
              strokeWidth={strokeWidth}
              absoluteStrokeWidth={absoluteStrokeWidth}
              color={color}
              fill={fill}
            />
          ) : (
            <Smile
              size={Math.min(size, 64)}
              strokeWidth={strokeWidth}
              className="text-muted-foreground/30"
            />
          )}
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5 animate-in fade-in-0 duration-150">
        <Ruler className="h-3 w-3 text-muted-foreground/40" />
        <span className="text-[10px] text-muted-foreground/50 font-mono tabular-nums">
          {size}px &middot; stroke {strokeWidth}
        </span>
      </div>
    </>
  );
}

interface IconColorControlProps {
  title: string;
  icon: ReactNode;
  inputId: string;
  fieldLabel: string;
  hint: string;
  placeholder: string;
  value: string;
  defaultValue: string;
  presets: readonly IconColorPreset[];
  summaryText: string;
  onChange: (value: string) => void;
}

function IconColorControl({
  title,
  icon,
  inputId,
  fieldLabel,
  hint,
  placeholder,
  value,
  defaultValue,
  presets,
  summaryText,
  onChange,
}: IconColorControlProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const swatchStyle =
    value !== "none"
      ? { backgroundColor: value === "currentColor" ? "#6b7280" : value }
      : undefined;

  return (
    <ConfigSection title={title} icon={icon}>
      <ConfigField label={fieldLabel} htmlFor={inputId} hint={hint}>
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "w-6 h-6 rounded border border-border/60 shrink-0",
              value === "none" &&
                "bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:8px_8px]",
            )}
            style={swatchStyle}
          />
          <Input
            id={inputId}
            type="text"
            value={draft}
            onChange={(e) => {
              const next = e.target.value;
              setDraft(next);
              if (next.trim() !== "") onChange(next);
            }}
            onBlur={() => {
              const next = draft.trim() || defaultValue;
              setDraft(next);
              if (next !== value) onChange(next);
            }}
            placeholder={placeholder}
            className="h-7 w-[110px] px-2 text-[11px] font-mono rounded-md"
            autoComplete="off"
          />
        </div>
      </ConfigField>

      <div className="flex items-center gap-1 flex-wrap pl-0.5">
        {presets.map((preset) => (
          <button
            key={preset.color}
            type="button"
            onClick={() => onChange(preset.color)}
            title={preset.label}
            className={cn(
              "w-5 h-5 rounded-full border transition-all",
              value === preset.color
                ? "ring-2 ring-primary ring-offset-1 ring-offset-background border-primary"
                : "border-border/50 hover:border-border hover:scale-110",
              preset.color === "none" &&
                "bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:6px_6px]",
              preset.color === "currentColor" &&
                "bg-gradient-to-br from-gray-400 to-gray-600",
            )}
            style={
              preset.color !== "none" && preset.color !== "currentColor"
                ? { backgroundColor: preset.color }
                : undefined
            }
          />
        ))}
      </div>

      <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
        {icon}
        <span className="text-[10px] text-muted-foreground/50">{summaryText}</span>
      </div>
    </ConfigSection>
  );
}

export function IconColorsContent({
  color,
  fill,
  onChangeColor,
  onChangeFill,
}: {
  color: string;
  fill: string;
  onChangeColor: (value: string) => void;
  onChangeFill: (value: string) => void;
}) {
  const strokeSummary =
    color === "currentColor"
      ? "Inheriting color from parent text color"
      : `Stroke: ${color}`;
  const fillSummary =
    fill === "none"
      ? "No fill — outlined icon"
      : fill === "currentColor"
        ? "Fill inheriting parent text color"
        : `Fill: ${fill}`;

  return (
    <>
      <IconColorControl
        title="Stroke Color"
        icon={<Paintbrush className="h-3 w-3 text-muted-foreground/40" />}
        inputId="icon-color"
        fieldLabel="Color"
        hint="The stroke (outline) color of the icon. Use 'currentColor' to inherit the text color from the parent element."
        placeholder="currentColor"
        value={color}
        defaultValue={DEFAULT_ICON_COLOR}
        presets={ICON_COLOR_PRESETS}
        summaryText={strokeSummary}
        onChange={onChangeColor}
      />

      <SectionDivider />

      <IconColorControl
        title="Fill Color"
        icon={<Droplets className="h-3 w-3 text-muted-foreground/40" />}
        inputId="icon-fill"
        fieldLabel="Fill"
        hint="The fill color for the icon interior. Use 'none' for outlined icons (default). Use 'currentColor' to fill with the inherited text color."
        placeholder="none"
        value={fill}
        defaultValue={DEFAULT_ICON_FILL}
        presets={FILL_COLOR_PRESETS}
        summaryText={fillSummary}
        onChange={onChangeFill}
      />
    </>
  );
}
