import type { CSSProperties } from "react";

export function eventsStyle(active: boolean): Pick<CSSProperties, "cursor" | "userSelect"> {
  return {
    cursor: active ? "pointer" : "inherit",
    userSelect: active ? "none" : "auto",
  };
}
