import { useState } from "react";
import type { ReactElement } from "react";
import { Check, Copy, Layers, Palette, Terminal } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConnectCliPanel from "@/features/agent/components/ConnectCliPanel";
import type { AiElementContext } from "../types";
import { buildElementContextSummary } from "../utils/aiChatUtils";

interface AiAgentTabProps {
  readonly selectedElement?: AiElementContext;
}

export function AiAgentTab({ selectedElement }: AiAgentTabProps): ReactElement {
  const [copiedContext, setCopiedContext] = useState(false);

  const handleCopyContext = async (): Promise<void> => {
    if (!selectedElement) return;
    try {
      await navigator.clipboard.writeText(buildElementContextSummary(selectedElement));
      setCopiedContext(true);
      toast.success("Copied element context for your CLI agent");
      window.setTimeout(() => setCopiedContext(false), 1800);
    } catch {
      toast.error("Failed to copy element context");
    }
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
      <div className="flex w-full min-w-0 flex-col gap-3 p-3">
        <Card className="gap-3 py-3 shadow-none">
          <CardHeader className="px-3 pb-0">
            <div className="flex items-center gap-2">
              <Terminal className="text-primary size-4 shrink-0" />
              <CardTitle className="text-xs font-semibold">
                External CLI &amp; MCP Agent
              </CardTitle>
            </div>
            <CardDescription className="text-[11px] leading-relaxed">
              Connect Claude Code, Codex, Antigravity, or OpenCode to inspect
              this project, edit elements live, manage CMS items, and apply
              theme presets.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5 px-3 pt-0">
            <Badge variant="secondary" className="gap-1 text-[10px] font-normal">
              <Layers className="size-3" />
              Live Canvas Edits
            </Badge>
            <Badge variant="secondary" className="gap-1 text-[10px] font-normal">
              <Palette className="size-3" />
              Theme &amp; Tokens
            </Badge>
          </CardContent>
        </Card>

        <ConnectCliPanel />

        <Card className="gap-2.5 py-3 shadow-none">
          <CardHeader className="px-3 pb-0">
            <CardTitle className="text-xs font-semibold">
              Selected Element Handoff
            </CardTitle>
            <CardDescription className="text-[11px]">
              Copy the active canvas element reference to paste directly into your
              external agent prompt.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pt-0">
            {selectedElement ? (
              <div className="flex flex-col gap-2">
                <div className="border-border bg-muted/40 rounded-md border px-2.5 py-2 font-mono text-[11px] leading-relaxed break-all">
                  {buildElementContextSummary(selectedElement)}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleCopyContext()}
                  className="h-7 w-full text-xs"
                >
                  {copiedContext ? (
                    <Check data-icon="inline-start" />
                  ) : (
                    <Copy data-icon="inline-start" />
                  )}
                  {copiedContext ? "Copied reference" : "Copy element reference"}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground rounded-md border border-dashed px-2.5 py-2 text-[11px]">
                Select any element on the canvas to copy its ID and context here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
