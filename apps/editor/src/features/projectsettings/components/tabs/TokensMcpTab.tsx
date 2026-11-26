import { useState, type ChangeEvent, type ReactElement, type ReactNode } from "react";
import { Braces, Check, Copy, Download, RotateCcw, Terminal, Upload } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_THEME_TOKENS,
  parseImportedThemeJson,
  type ThemeTokens,
} from "../../constants/themePresets";
import { generateDesignSystemCSS } from "../../utils/designSystemUtils";
import type { ProjectSettingsState } from "../../utils/projectSettingsState";

interface TokensMcpTabProps {
  readonly projectId: string;
  readonly state: Readonly<ProjectSettingsState>;
  readonly disabled?: boolean;
  readonly mcpConnectPanel?: ReactNode;
  readonly onApplyThemeTokens: (tokens: ThemeTokens) => void;
}

function buildThemeJsonObject(state: Readonly<ProjectSettingsState>): Record<string, unknown> {
  return {
    ...state.selectedColors,
    fontFamily: state.fontFamily,
    letterTracking: state.letterTracking,
    borderRadius: state.borderRadius,
    spacing: state.spacing,
    shadowStyle: state.shadowStyle,
  };
}

function copyText(text: string, label: string, onCopied?: () => void): void {
  void navigator.clipboard.writeText(text).then(
    () => {
      toast.success(`${label} copied`);
      onCopied?.();
    },
    () => toast.error(`Could not copy ${label.toLowerCase()}`),
  );
}

export function TokensMcpTab({
  projectId,
  state,
  disabled = false,
  mcpConnectPanel,
  onApplyThemeTokens,
}: TokensMcpTabProps): ReactElement {
  const [importText, setImportText] = useState("");
  const [copiedKey, setCopiedKey] = useState<"json" | "css" | "mcp" | null>(null);

  const themeJson = JSON.stringify(buildThemeJsonObject(state), null, 2);
  const cssVariables = generateDesignSystemCSS({
    colors: state.selectedColors,
    fontFamily: state.fontFamily,
    letterTracking: state.letterTracking,
    borderRadius: state.borderRadius,
    spacing: state.spacing,
    shadowStyle: state.shadowStyle,
  });

  const mcpSnippet = JSON.stringify(
    {
      tool: "set_project_style",
      arguments: {
        projectId,
        theme: buildThemeJsonObject(state),
      },
    },
    null,
    2,
  );

  const markCopied = (key: "json" | "css" | "mcp"): void => {
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1500);
  };

  const handleImport = (): void => {
    const trimmed = importText.trim();
    if (!trimmed) {
      toast.error("Paste theme JSON to import");
      return;
    }
    const result = parseImportedThemeJson(trimmed, {
      colors: state.selectedColors,
      fontFamily: state.fontFamily,
      letterTracking: state.letterTracking,
      borderRadius: state.borderRadius,
      spacing: state.spacing,
      shadowStyle: state.shadowStyle,
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onApplyThemeTokens(result.value);
    setImportText("");
    toast.success("Theme tokens applied to draft");
  };

  const handleDownloadJson = (): void => {
    const blob = new Blob([themeJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.subdomain || "project"}-theme.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Braces className="size-4 text-primary" />
              Theme Tokens Export &amp; Import
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => onApplyThemeTokens(DEFAULT_THEME_TOKENS)}
              className="h-7 px-2 text-xs text-muted-foreground"
            >
              <RotateCcw data-icon="inline-start" />
              Reset Theme
            </Button>
          </div>
          <CardDescription>
            Export CSS variables, download JSON, or import a theme token object.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyText(themeJson, "Theme JSON", () => markCopied("json"))}
            >
              {copiedKey === "json" ? (
                <Check data-icon="inline-start" />
              ) : (
                <Copy data-icon="inline-start" />
              )}
              Copy Theme JSON
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyText(cssVariables.trim(), "CSS Variables", () => markCopied("css"))}
            >
              {copiedKey === "css" ? (
                <Check data-icon="inline-start" />
              ) : (
                <Copy data-icon="inline-start" />
              )}
              Copy CSS Variables
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadJson}
            >
              <Download data-icon="inline-start" />
              Download JSON
            </Button>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Label htmlFor="import-theme-json">Import Theme JSON</Label>
            <Textarea
              id="import-theme-json"
              value={importText}
              disabled={disabled}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setImportText(event.target.value)
              }
              placeholder='{"primary":"#6366f1","fontFamily":"Inter","borderRadius":10}'
              spellCheck={false}
              className="min-h-24 font-mono text-xs"
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={disabled || importText.trim().length === 0}
                onClick={handleImport}
              >
                <Upload data-icon="inline-start" />
                Apply Theme JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Terminal className="size-4 text-primary" />
              MCP Theme Integration
            </CardTitle>
            <Badge variant="secondary" className="font-mono text-[11px]">
              set_project_style
            </Badge>
          </div>
          <CardDescription>
            Connect Claude Code, Codex, Antigravity, or OpenCode to read and update this theme with MCP. Keep the project editor open while agents apply edits.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {mcpConnectPanel && (
            <>
              {mcpConnectPanel}
              <Separator />
            </>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Theme MCP Tool Payload</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copyText(mcpSnippet, "MCP payload", () => markCopied("mcp"))}
                className="h-7 px-2 text-xs"
              >
                {copiedKey === "mcp" ? (
                  <Check data-icon="inline-start" />
                ) : (
                  <Copy data-icon="inline-start" />
                )}
                Copy Payload
              </Button>
            </div>
            <pre className="max-h-48 overflow-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed text-foreground">
              {mcpSnippet}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
