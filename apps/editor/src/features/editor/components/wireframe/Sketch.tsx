import type { CSSProperties } from "react";
import { X } from "lucide-react";
import { cn } from "@webbuilder/site-runtime/lib/utils";
import type { SketchNode } from "./sketchModel";

const LINE_WIDTHS = ["100%", "82%", "58%"];

function resolveGridColumns(cols: number, children: readonly SketchNode[]): number {
  const hasExplicitSpan = children.some((child) => child.span !== undefined);
  if (hasExplicitSpan) {
    return Math.max(1, Math.min(cols, 12));
  }
  const childCount = Math.max(children.length, 1);
  return Math.max(1, Math.min(cols, childCount, 6));
}

function childGridStyle(
  child: SketchNode,
  effectiveCols: number | undefined,
): CSSProperties | undefined {
  if (effectiveCols === undefined || child.span === undefined) return undefined;
  const clamped = Math.max(1, Math.min(child.span, effectiveCols));
  return { gridColumn: `span ${clamped} / span ${clamped}` };
}

/** Draws a sketch tree in neutral greys. Never renders text content. */
export function Sketch({
  node,
  className,
  style,
}: {
  node: SketchNode;
  className?: string;
  style?: CSSProperties;
}): React.JSX.Element {
  switch (node.kind) {
    case "heading":
      return (
        <div
          className={cn("h-2 max-w-full rounded-sm bg-foreground/35", className)}
          style={{ ...style, width: `${node.width}%` }}
        />
      );
    case "text":
      return (
        <div className={cn("flex w-full flex-col gap-1", className)} style={style}>
          {LINE_WIDTHS.slice(0, node.lines).map((w, i) => (
            <div
              key={i}
              className="h-[3px] rounded-full bg-foreground/20"
              style={{ width: node.lines === 1 ? "70%" : w }}
            />
          ))}
        </div>
      );
    case "button":
      return <div className={cn("h-3 w-10 shrink-0 rounded-full bg-foreground/30", className)} style={style} />;
    case "link":
      return <div className={cn("h-[3px] w-8 shrink-0 rounded-full bg-foreground/30", className)} style={style} />;
    case "media":
      return (
        <div
          className={cn(
            "flex aspect-[16/9] w-full min-w-6 items-center justify-center rounded-sm border border-foreground/15 bg-foreground/5 text-foreground/20",
            className,
          )}
          style={style}
        >
          <X className="h-3 w-3" />
        </div>
      );
    case "field":
      return <div className={cn("h-3.5 w-full min-w-8 rounded-sm border border-foreground/25", className)} style={style} />;
    case "icon":
      return <div className={cn("h-3 w-3 shrink-0 rounded-sm bg-foreground/25", className)} style={style} />;
    case "rule":
      return <div className={cn("h-px w-full bg-foreground/20", className)} style={style} />;
    case "more":
      return (
        <div
          className={cn(
            "flex h-3 min-w-5 shrink-0 items-center justify-center rounded-sm bg-foreground/10 px-1 text-[8px] leading-none text-foreground/40",
            className,
          )}
          style={style}
        >
          {node.count ? `+${node.count}` : "…"}
        </div>
      );
    case "plain":
      return <div className={cn("h-4 w-full rounded-sm bg-foreground/10", className)} style={style} />;
    case "box": {
      const effectiveCols =
        node.cols !== undefined ? resolveGridColumns(node.cols, node.children) : undefined;
      const isSingleBoxWrapper = node.children.length === 1 && node.children[0].kind === "box";
      const hasBoxChildren = node.children.some((c) => c.kind === "box");

      return (
        <div
          className={cn(
            "min-h-3 w-full min-w-0 gap-1.5 rounded-sm",
            effectiveCols !== undefined
              ? "grid items-start"
              : node.dir === "row"
                ? hasBoxChildren
                  ? "flex flex-row items-start"
                  : "flex flex-row flex-wrap items-center"
                : "flex flex-col",
            className,
          )}
          style={{
            ...style,
            ...(effectiveCols !== undefined
              ? { gridTemplateColumns: `repeat(${effectiveCols}, minmax(0, 1fr))` }
              : undefined),
          }}
        >
          {node.children.map((child, i) => {
            const boxClass =
              child.kind === "box"
                ? isSingleBoxWrapper
                  ? "w-full"
                  : cn(
                      "rounded-sm border border-foreground/10 p-1",
                      effectiveCols === undefined && node.dir === "row" ? "flex-1" : "w-full",
                    )
                : effectiveCols === undefined &&
                    node.dir === "row" &&
                    (child.kind === "text" || child.kind === "media" || child.kind === "field")
                  ? "flex-1"
                  : undefined;

            return (
              <Sketch
                key={i}
                node={child}
                className={boxClass}
                style={childGridStyle(child, effectiveCols)}
              />
            );
          })}
        </div>
      );
    }
  }
}
