import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SketchNode } from "./sketchModel";

const LINE_WIDTHS = ["100%", "82%", "58%"];

/** Draws a sketch tree in neutral greys. Never renders text content. */
export function Sketch({ node, className }: { node: SketchNode; className?: string }) {
  switch (node.kind) {
    case "heading":
      return <div className={cn("h-2 rounded-sm bg-foreground/35", className)} style={{ width: `${node.width}%` }} />;
    case "text":
      return (
        <div className={cn("flex w-full flex-col gap-1", className)}>
          {LINE_WIDTHS.slice(0, node.lines).map((w, i) => (
            <div key={i} className="h-[3px] rounded-full bg-foreground/20" style={{ width: node.lines === 1 ? "70%" : w }} />
          ))}
        </div>
      );
    case "button":
      return <div className={cn("h-3 w-10 shrink-0 rounded-full bg-foreground/30", className)} />;
    case "link":
      return <div className={cn("h-[3px] w-8 shrink-0 rounded-full bg-foreground/30", className)} />;
    case "media":
      return (
        <div className={cn("flex aspect-[16/9] w-full min-w-6 items-center justify-center rounded-sm border border-foreground/15 bg-foreground/5 text-foreground/20", className)}>
          <X className="h-3 w-3" />
        </div>
      );
    case "field":
      return <div className={cn("h-3.5 w-full min-w-8 rounded-sm border border-foreground/25", className)} />;
    case "icon":
      return <div className={cn("h-3 w-3 shrink-0 rounded-sm bg-foreground/25", className)} />;
    case "rule":
      return <div className={cn("h-px w-full bg-foreground/20", className)} />;
    case "more":
      return (
        <div className={cn("flex h-3 min-w-5 shrink-0 items-center justify-center rounded-sm bg-foreground/10 px-1 text-[8px] leading-none text-foreground/40", className)}>
          {node.count ? `+${node.count}` : "…"}
        </div>
      );
    case "plain":
      return <div className={cn("h-4 w-full rounded-sm bg-foreground/10", className)} />;
    case "box": {
      const grid = node.cols !== undefined;
      return (
        <div
          className={cn(
            "min-h-3 w-full min-w-0 gap-1.5 rounded-sm",
            grid ? "grid" : node.dir === "row" ? "flex flex-row items-center" : "flex flex-col",
            className,
          )}
          style={grid ? { gridTemplateColumns: `repeat(${Math.min(node.cols!, 6)}, minmax(0, 1fr))` } : undefined}
        >
          {node.children.map((child, i) => (
            <Sketch
              key={i}
              node={child}
              className={child.kind === "box" ? "flex-1 rounded-sm border border-foreground/10 p-1" : node.dir === "row" && (child.kind === "text" || child.kind === "media" || child.kind === "field") ? "flex-1" : undefined}
            />
          ))}
        </div>
      );
    }
  }
}
