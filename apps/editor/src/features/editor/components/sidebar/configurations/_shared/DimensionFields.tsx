import React, { ChangeEvent } from "react";
import { Monitor } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ConfigField } from "./ConfigField";

interface DimensionFieldsProps {
  /** Prefix for the input ids, e.g. "video" -> "video-width" / "video-height" */
  idPrefix: string;
  width?: number | string;
  height?: number | string;
  /** Called with the parsed pixel value, or undefined when the input is empty/invalid */
  onChange: (name: "width" | "height", value: number | undefined) => void;
  widthHint: string;
  heightHint: string;
}

const PIXEL_INPUT_CLASS =
  "h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md";

/**
 * Intrinsic width/height pixel inputs plus a "w × h" summary line, shared by
 * the media-like configuration panels (Video, IFrame).
 */
export function DimensionFields({
  idPrefix,
  width,
  height,
  onChange,
  widthHint,
  heightHint,
}: DimensionFieldsProps) {
  const createDimensionChangeHandler =
    (name: "width" | "height") => (e: ChangeEvent<HTMLInputElement>) => {
      const parsed = parseInt(e.target.value, 10);
      onChange(name, isNaN(parsed) ? undefined : parsed);
    };

  const renderField = (
    name: "width" | "height",
    label: string,
    hint: string,
    value: number | string | undefined,
  ) => (
    <ConfigField label={label} htmlFor={`${idPrefix}-${name}`} hint={hint}>
      <div className="flex items-center gap-1">
        <Input
          id={`${idPrefix}-${name}`}
          type="number"
          value={value ?? ""}
          onChange={createDimensionChangeHandler(name)}
          placeholder="auto"
          min={0}
          className={PIXEL_INPUT_CLASS}
        />
        <span className="text-[10px] text-muted-foreground/60 font-medium select-none">
          px
        </span>
      </div>
    </ConfigField>
  );

  return (
    <>
      {renderField("width", "Width", widthHint, width)}
      {renderField("height", "Height", heightHint, height)}

      {(width || height) && (
        <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
          <Monitor className="h-3 w-3 text-muted-foreground/40" />
          <span className="text-[10px] text-muted-foreground/50 font-mono">
            {width ?? "auto"} × {height ?? "auto"}
          </span>
        </div>
      )}
    </>
  );
}
