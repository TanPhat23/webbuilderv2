"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { DisplayStyles, UpdateStyleFn } from "./types";

interface ClipContentCheckProps {
  /** Current overflow value */
  overflow: DisplayStyles["overflow"];
  /** Style update callback */
  updateStyle: UpdateStyleFn;
  /** Unique id suffix to avoid collisions when multiple instances exist */
  idSuffix?: string;
}

/**
 * Figma-style "Clip content" checkbox that toggles `overflow: hidden`.
 *
 * ┌──────────────────────────────┐
 * │  ☐  Clip content             │
 * └──────────────────────────────┘
 */
export function ClipContentCheck({
  overflow,
  updateStyle,
  idSuffix = "",
}: ClipContentCheckProps) {
  const id = `clip-content${idSuffix ? `-${idSuffix}` : ""}`;

  return (
    <div className="flex items-center gap-2 px-0.5">
      <Checkbox
        id={id}
        checked={overflow === "hidden"}
        onCheckedChange={(checked) =>
          updateStyle("overflow", checked ? "hidden" : "visible")
        }
        className="h-3.5 w-3.5"
      />
      <Label
        htmlFor={id}
        className="text-[11px] font-medium text-muted-foreground select-none cursor-pointer"
      >
        Clip content
      </Label>
    </div>
  );
}
