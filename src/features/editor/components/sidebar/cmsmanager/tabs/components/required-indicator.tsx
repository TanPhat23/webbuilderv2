import React from "react";
import { cn } from "@/lib/utils";

interface RequiredIndicatorProps {
  /**
   * Whether the field is required
   */
  required: boolean;
  /**
   * Custom class name
   */
  className?: string;
  /**
   * Custom label text (defaults to "*")
   */
  label?: string;
}

/**
 * Reusable required field indicator component
 * Uses destructive color from globals.css theme instead of hardcoded text-red-500
 */
export function RequiredIndicator({
  required,
  className,
  label = "*",
}: RequiredIndicatorProps) {
  if (!required) return null;

  return (
    <span
      className={cn("ml-1 text-destructive", className)}
      aria-label="required"
    >
      {label}
    </span>
  );
}
