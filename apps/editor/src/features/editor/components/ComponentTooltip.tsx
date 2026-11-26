"use client";

import React, { type ReactElement, type ReactNode, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ElementType } from "@webbuilder/site-runtime/types/global.type";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Grid3X3,
  Image as ImageIcon,
  List as ListIcon,
  Play,
  Send,
  Sparkles,
  Upload,
  Volume2,
} from "lucide-react";

interface ComponentTooltipProps {
  children: ReactNode;
  componentType: ElementType;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

type ComponentCategory =
  | "Structure"
  | "Typography"
  | "Media"
  | "Interactive"
  | "Form"
  | "Data"
  | "CMS";

interface ComponentMeta {
  readonly title: string;
  readonly category: ComponentCategory;
  readonly description: string;
}

const COMPONENT_INFO: Readonly<Partial<Record<ElementType, ComponentMeta>>> = {
  Text: {
    title: "Text",
    category: "Typography",
    description: "Paragraph text block. Double-click on canvas to edit inline.",
  },
  Span: {
    title: "Span",
    category: "Typography",
    description: "Inline text wrapper for styling words or phrases.",
  },
  Heading: {
    title: "Heading",
    category: "Typography",
    description: "Semantic heading element across levels H1–H6.",
  },
  Label: {
    title: "Label",
    category: "Form",
    description: "Accessible caption paired with form controls.",
  },
  Blockquote: {
    title: "Blockquote",
    category: "Typography",
    description: "Highlighted pull-quote or cited excerpt.",
  },
  Code: {
    title: "Code",
    category: "Typography",
    description: "Monospace snippet for inline or block code.",
  },
  Button: {
    title: "Button",
    category: "Interactive",
    description: "Clickable action trigger for flows or navigation.",
  },
  Section: {
    title: "Section",
    category: "Structure",
    description: "Full-width page band for organizing layout regions.",
  },
  Frame: {
    title: "Frame",
    category: "Structure",
    description: "Flexible flex/grid container for grouping elements.",
  },
  Nav: {
    title: "Navigation",
    category: "Structure",
    description: "Semantic navigation bar for links and menus.",
  },
  Header: {
    title: "Header",
    category: "Structure",
    description: "Top-of-page or section header container.",
  },
  Footer: {
    title: "Footer",
    category: "Structure",
    description: "Bottom container for links, credits, and metadata.",
  },
  Article: {
    title: "Article",
    category: "Structure",
    description: "Self-contained content block for posts or cards.",
  },
  Aside: {
    title: "Aside",
    category: "Structure",
    description: "Complementary sidebar or callout region.",
  },
  Image: {
    title: "Image",
    category: "Media",
    description: "Responsive image supporting uploads or external URLs.",
  },
  Video: {
    title: "Video",
    category: "Media",
    description: "Embedded or uploaded video player.",
  },
  Audio: {
    title: "Audio",
    category: "Media",
    description: "Embedded audio player with playback controls.",
  },
  IFrame: {
    title: "IFrame",
    category: "Media",
    description: "Sandboxed embed for external pages or widgets.",
  },
  Icon: {
    title: "Icon",
    category: "Media",
    description: "Scalable vector icon from the built-in icon set.",
  },
  Link: {
    title: "Link",
    category: "Interactive",
    description: "Hyperlink to another page, anchor, or external URL.",
  },
  Carousel: {
    title: "Carousel",
    category: "Interactive",
    description: "Horizontally scrollable slide deck for media or cards.",
  },
  Separator: {
    title: "Separator",
    category: "Structure",
    description: "Subtle horizontal or vertical divider rule.",
  },
  Input: {
    title: "Input",
    category: "Form",
    description: "Single-line text field for user input.",
  },
  Textarea: {
    title: "Textarea",
    category: "Form",
    description: "Multi-line text area for longer entries.",
  },
  Checkbox: {
    title: "Checkbox",
    category: "Form",
    description: "Boolean toggle for one or more selections.",
  },
  Radio: {
    title: "Radio",
    category: "Form",
    description: "Single-choice option within a radio group.",
  },
  Select: {
    title: "Select",
    category: "Form",
    description: "Dropdown menu for choosing from a list of options.",
  },
  Form: {
    title: "Form",
    category: "Form",
    description: "Structured container for inputs and submissions.",
  },
  Progress: {
    title: "Progress",
    category: "Data",
    description: "Visual completion bar for status or metrics.",
  },
  List: {
    title: "List",
    category: "Data",
    description: "Ordered or unordered list of items.",
  },
  Table: {
    title: "Table",
    category: "Data",
    description: "Structured rows and columns for tabular data.",
  },
  CMSContentList: {
    title: "CMS List",
    category: "CMS",
    description: "Dynamic vertical list bound to a CMS collection.",
  },
  CMSContentItem: {
    title: "CMS Item",
    category: "CMS",
    description: "Single CMS entry displaying bound fields.",
  },
  CMSContentGrid: {
    title: "CMS Grid",
    category: "CMS",
    description: "Responsive multi-column grid bound to a CMS collection.",
  },
};

const PREVIEWS: Readonly<Partial<Record<ElementType, ReactElement>>> = {
  Text: (
    <div className="w-full space-y-1.5 rounded-md border border-border/60 bg-background/80 p-2.5">
      <div className="h-2 w-11/12 rounded-full bg-foreground/70" />
      <div className="h-2 w-4/5 rounded-full bg-muted-foreground/40" />
      <div className="h-2 w-3/5 rounded-full bg-muted-foreground/30" />
    </div>
  ),
  Heading: (
    <div className="flex w-full items-center justify-between rounded-md border border-border/60 bg-background/80 px-3 py-2.5">
      <span className="text-base font-semibold tracking-tight text-foreground">
        Heading
      </span>
      <Badge variant="secondary" className="rounded px-1.5 py-0 font-mono text-[10px]">
        H1–H6
      </Badge>
    </div>
  ),
  Span: (
    <div className="flex w-full items-center gap-1.5 rounded-md border border-border/60 bg-background/80 px-3 py-2.5 text-xs text-muted-foreground">
      <span>Inline</span>
      <Badge variant="secondary" className="rounded bg-primary/15 px-1.5 py-0 text-[11px] text-primary">
        highlighted
      </Badge>
      <span>span</span>
    </div>
  ),
  Label: (
    <div className="w-full space-y-1.5 rounded-md border border-border/60 bg-background/80 p-2.5">
      <Label className="text-[11px]">Email address</Label>
      <Input readOnly tabIndex={-1} value="" placeholder="name@example.com" className="h-6 text-[11px]" />
    </div>
  ),
  Blockquote: (
    <div className="w-full rounded-md border border-border/60 border-l-2 border-l-primary bg-background/80 px-3 py-2.5">
      <p className="text-xs italic text-muted-foreground">
        “Design is how it works.”
      </p>
    </div>
  ),
  Code: (
    <div className="w-full rounded-md border border-border/60 bg-background px-3 py-2.5 font-mono text-[11px] text-emerald-400">
      <span className="text-muted-foreground">const</span>{" "}
      <span className="text-foreground">ready</span> = true;
    </div>
  ),
  Button: (
    <div className="flex w-full items-center justify-center rounded-md border border-border/60 bg-background/80 py-3">
      <Button size="sm" tabIndex={-1} className="h-7 px-3 text-xs">
        Get started
      </Button>
    </div>
  ),
  Section: (
    <div className="flex w-full flex-col gap-1.5 rounded-md border border-dashed border-primary/50 bg-primary/5 p-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-primary">Section</span>
        <span className="font-mono text-[9px] text-muted-foreground">100%</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <div className="h-6 rounded bg-muted/70" />
        <div className="h-6 rounded bg-muted/70" />
      </div>
    </div>
  ),
  Frame: (
    <div className="flex h-16 w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-background/70">
      <Upload className="h-4 w-4 text-muted-foreground" />
      <span className="text-[10px] font-medium text-muted-foreground">
        Drop elements inside
      </span>
    </div>
  ),
  Nav: (
    <div className="flex w-full items-center justify-between rounded-md border border-border/60 bg-background/80 px-3 py-2.5">
      <div className="h-2.5 w-10 rounded-full bg-foreground/70" />
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-6 rounded-full bg-muted-foreground/50" />
        <div className="h-1.5 w-6 rounded-full bg-muted-foreground/50" />
        <div className="h-1.5 w-6 rounded-full bg-muted-foreground/50" />
      </div>
    </div>
  ),
  Header: (
    <div className="w-full overflow-hidden rounded-md border border-border/60 bg-background/80">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/50 px-2.5 py-1.5">
        <div className="h-2 w-8 rounded-full bg-foreground/70" />
        <div className="h-2 w-12 rounded-full bg-muted-foreground/40" />
      </div>
      <div className="h-6 bg-background/40" />
    </div>
  ),
  Footer: (
    <div className="w-full overflow-hidden rounded-md border border-border/60 bg-background/80">
      <div className="h-6 bg-background/40" />
      <div className="flex items-center justify-between border-t border-border/60 bg-muted/50 px-2.5 py-1.5">
        <span className="text-[10px] text-muted-foreground">© Brand</span>
        <div className="flex gap-1.5">
          <div className="h-1.5 w-5 rounded-full bg-muted-foreground/40" />
          <div className="h-1.5 w-5 rounded-full bg-muted-foreground/40" />
        </div>
      </div>
    </div>
  ),
  Article: (
    <div className="w-full space-y-1.5 rounded-md border border-border/60 bg-background/80 p-2.5">
      <div className="h-2.5 w-2/3 rounded-full bg-foreground/75" />
      <div className="h-1.5 w-full rounded-full bg-muted-foreground/40" />
      <div className="h-1.5 w-5/6 rounded-full bg-muted-foreground/30" />
    </div>
  ),
  Aside: (
    <div className="grid h-14 w-full grid-cols-3 gap-1.5 rounded-md border border-border/60 bg-background/80 p-2">
      <div className="col-span-2 rounded bg-muted/30" />
      <div className="rounded border-l-2 border-primary/60 bg-primary/10" />
    </div>
  ),
  Image: (
    <div className="flex h-16 w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-background/70">
      <ImageIcon className="h-5 w-5 text-muted-foreground" />
      <span className="text-[10px] text-muted-foreground">PNG, JPG, WebP</span>
    </div>
  ),
  Video: (
    <div className="flex h-16 w-full items-center justify-center rounded-md border border-border/60 bg-background">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Play className="h-4 w-4 translate-x-0.5 fill-current" />
      </div>
    </div>
  ),
  Audio: (
    <div className="flex w-full items-center gap-2.5 rounded-md border border-border/60 bg-background/80 px-3 py-2.5">
      <Volume2 className="h-4 w-4 shrink-0 text-primary" />
      <div className="flex flex-1 items-center gap-1">
        {[10, 16, 8, 18, 12, 15, 7, 14, 10, 16, 9].map((h, i) => (
          <div
            key={i}
            className="w-1 rounded-full bg-muted-foreground/50"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
    </div>
  ),
  IFrame: (
    <div className="w-full overflow-hidden rounded-md border border-border/60 bg-background/80">
      <div className="flex items-center gap-1 border-b border-border/60 bg-muted/50 px-2 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
      </div>
      <div className="flex h-10 items-center justify-center font-mono text-[10px] text-muted-foreground">
        &lt;iframe /&gt;
      </div>
    </div>
  ),
  Icon: (
    <div className="flex h-14 w-full items-center justify-center rounded-md border border-border/60 bg-background/80">
      <Sparkles className="h-5 w-5 text-primary" />
    </div>
  ),
  Link: (
    <div className="flex w-full items-center justify-between rounded-md border border-border/60 bg-background/80 px-3 py-2.5">
      <span className="text-xs font-medium text-primary underline underline-offset-4">
        Learn more
      </span>
      <ExternalLink className="h-3.5 w-3.5 text-primary/80" />
    </div>
  ),
  Carousel: (
    <div className="flex h-16 w-full flex-col items-center justify-center gap-1.5 rounded-md border border-border/60 bg-background/80 px-2">
      <div className="flex w-full items-center justify-between">
        <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="flex h-8 w-24 items-center justify-center rounded bg-primary/15 text-[11px] font-medium text-primary">
          1 / 3
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex gap-1">
        <span className="h-1.5 w-3 rounded-full bg-primary" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
      </div>
    </div>
  ),
  Separator: (
    <div className="flex h-12 w-full items-center justify-center rounded-md border border-border/60 bg-background/80 px-4">
      <Separator />
    </div>
  ),
  Input: (
    <div className="w-full rounded-md border border-border/60 bg-background/80 p-2">
      <Input readOnly tabIndex={-1} value="" placeholder="Placeholder…" className="h-7 text-xs" />
    </div>
  ),
  Textarea: (
    <div className="w-full rounded-md border border-border/60 bg-background/80 p-2">
      <Textarea readOnly tabIndex={-1} value="" placeholder="Write a message…" className="min-h-12 resize-none py-1.5 text-xs" />
    </div>
  ),
  Checkbox: (
    <div className="flex w-full items-center gap-2 rounded-md border border-border/60 bg-background/80 px-3 py-2.5">
      <Checkbox checked tabIndex={-1} aria-hidden />
      <Label className="text-xs font-normal">Accept terms</Label>
    </div>
  ),
  Radio: (
    <div className="flex w-full items-center gap-2 rounded-md border border-border/60 bg-background/80 px-3 py-2.5">
      <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-primary">
        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
      </div>
      <Label className="text-xs font-normal">Option A</Label>
    </div>
  ),
  Select: (
    <div className="flex w-full items-center justify-between rounded-md border border-border/70 bg-background/80 px-2.5 py-2">
      <span className="text-xs text-muted-foreground">Choose option</span>
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  ),
  Form: (
    <div className="w-full space-y-2 rounded-md border border-border/60 bg-background/80 p-2.5">
      <Input readOnly tabIndex={-1} value="" placeholder="Your email" className="h-6 text-[11px]" />
      <div className="flex items-center justify-end">
        <Button size="sm" tabIndex={-1} className="h-6 gap-1 px-2 text-[10px]">
          <Send className="h-2.5 w-2.5" />
          Submit
        </Button>
      </div>
    </div>
  ),
  Progress: (
    <div className="w-full space-y-1.5 rounded-md border border-border/60 bg-background/80 p-2.5">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Progress</span>
        <span className="font-mono text-foreground">68%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-2/3 rounded-full bg-primary" />
      </div>
    </div>
  ),
  List: (
    <div className="w-full space-y-1.5 rounded-md border border-border/60 bg-background/80 p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
        <ListIcon className="h-3 w-3" />
        <span>Items</span>
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <div className="h-1.5 flex-1 rounded-full bg-muted-foreground/40" />
        </div>
      ))}
    </div>
  ),
  Table: (
    <div className="w-full overflow-hidden rounded-md border border-border/60 bg-background/80 text-[10px]">
      <div className="grid grid-cols-2 border-b border-border/60 bg-muted/50 px-2 py-1 font-medium text-foreground">
        <span>Column A</span>
        <span>Column B</span>
      </div>
      <div className="grid grid-cols-2 px-2 py-1 text-muted-foreground">
        <span>Value 1</span>
        <span>Value 2</span>
      </div>
    </div>
  ),
  CMSContentList: (
    <div className="w-full space-y-1.5 rounded-md border border-border/60 bg-background/80 p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-primary">
        <FileText className="h-3 w-3" />
        <span>Collection List</span>
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2 rounded bg-muted/40 p-1.5">
          <div className="h-5 w-5 shrink-0 rounded bg-primary/20" />
          <div className="flex-1 space-y-1">
            <div className="h-1.5 w-3/4 rounded-full bg-foreground/60" />
            <div className="h-1 w-1/2 rounded-full bg-muted-foreground/40" />
          </div>
        </div>
      ))}
    </div>
  ),
  CMSContentItem: (
    <div className="w-full space-y-1.5 rounded-md border border-border/60 bg-background/80 p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-primary">
        <FileText className="h-3 w-3" />
        <span>Collection Item</span>
      </div>
      <div className="h-8 w-full rounded bg-primary/15" />
      <div className="h-1.5 w-4/5 rounded-full bg-foreground/60" />
    </div>
  ),
  CMSContentGrid: (
    <div className="w-full space-y-1.5 rounded-md border border-border/60 bg-background/80 p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-primary">
        <Grid3X3 className="h-3 w-3" />
        <span>Collection Grid</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-6 rounded bg-primary/15" />
        ))}
      </div>
    </div>
  ),
};

export function ComponentTooltip({
  children,
  componentType,
  side = "right",
  sideOffset = 10,
}: ComponentTooltipProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const info = COMPONENT_INFO[componentType];

  useEffect(() => {
    if (!isOpen) return;
    const close = (): void => setIsOpen(false);
    const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement | null;
    const iframeDoc = iframe?.contentDocument ?? null;

    window.addEventListener("dragstart", close, true);
    window.addEventListener("pointerdown", close, true);
    window.addEventListener("blur", close);
    iframe?.addEventListener("pointerenter", close);
    iframe?.addEventListener("mouseenter", close);
    iframeDoc?.addEventListener("pointermove", close, { passive: true });
    iframeDoc?.addEventListener("dragover", close, { passive: true });

    return () => {
      window.removeEventListener("dragstart", close, true);
      window.removeEventListener("pointerdown", close, true);
      window.removeEventListener("blur", close);
      iframe?.removeEventListener("pointerenter", close);
      iframe?.removeEventListener("mouseenter", close);
      iframeDoc?.removeEventListener("pointermove", close);
      iframeDoc?.removeEventListener("dragover", close);
    };
  }, [isOpen]);

  if (!info) return <>{children}</>;
  const preview = PREVIEWS[componentType];

  return (
    <TooltipProvider delayDuration={350} skipDelayDuration={150}>
      <Tooltip
        open={isOpen}
        onOpenChange={setIsOpen}
        disableHoverableContent
      >
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={sideOffset}
          collisionPadding={12}
          hideArrow
          className="pointer-events-none w-60 overflow-hidden rounded-xl border border-border/80 bg-popover/95 p-0 text-popover-foreground shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-start justify-between gap-2 px-3 pt-2.5 pb-2">
            <div className="min-w-0">
              <h4 className="text-xs font-semibold tracking-tight text-foreground">
                {info.title}
              </h4>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                {info.description}
              </p>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 rounded-md px-1.5 py-0 text-[10px] font-medium text-muted-foreground"
            >
              {info.category}
            </Badge>
          </div>

          {preview && (
            <>
              <Separator className="opacity-50" />
              <div className="bg-muted/30 px-3 py-2.5">{preview}</div>
            </>
          )}

          <Separator className="opacity-50" />
          <div className="bg-muted/20 px-3 py-1.5 text-[10px] text-muted-foreground/80">
            Drag onto canvas to insert
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
