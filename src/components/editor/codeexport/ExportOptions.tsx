"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ExportOptions as ExportOptionsType } from "./types";

interface ExportOptionsProps {
  options: ExportOptionsType;
  onOptionChange: (option: keyof ExportOptionsType, value?: any) => void;
  isGenerating: boolean;
}

export function ExportOptions({
  options,
  onOptionChange,
  isGenerating,
}: ExportOptionsProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center space-x-2">
        <select
          value={options.exportFormat}
          onChange={(e) => onOptionChange("exportFormat", e.target.value)}
          className="px-3 py-1 border rounded"
          disabled={isGenerating}
        >
          <option value="html">HTML Export</option>
          <option value="react">React Export</option>
          <option value="vue">Vue Export</option>
          <option value="angular">Angular Export</option>
        </select>
      </div>
      {options.exportFormat === "html" && (
        <>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tailwind"
              checked={options.includeTailwind}
              onCheckedChange={() => onOptionChange("includeTailwind")}
              disabled={isGenerating}
            />
            <Label htmlFor="tailwind">Include Tailwind classes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="responsive"
              checked={options.responsiveBreakpoints}
              onCheckedChange={() => onOptionChange("responsiveBreakpoints")}
              disabled={isGenerating}
            />
            <Label htmlFor="responsive">Responsive breakpoints</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="minify"
              checked={options.minify}
              onCheckedChange={() => onOptionChange("minify")}
              disabled={isGenerating}
            />
            <Label htmlFor="minify">Minify output</Label>
          </div>
        </>
      )}
    </div>
  );
}
