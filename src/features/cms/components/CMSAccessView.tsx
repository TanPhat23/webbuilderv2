import React, { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Globe, Sparkles, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useCMSContext } from "../provider/CMSProvider";
import { buildPublicCollectionEndpoint } from "../services/webhook.service";

type McpPayloadMode = "list_items" | "upsert_items";

interface CMSAccessViewProps {
  readonly projectId?: string;
  readonly onOpenMcp?: () => void;
}

function resolveApiOrigin(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  return typeof envUrl === "string" && envUrl.length > 0
    ? envUrl
    : "http://localhost:8080";
}

function sampleValueForFieldType(fieldType: string): string {
  switch (fieldType) {
    case "richtext":
      return "<p>Rich text content</p>";
    case "boolean":
      return "true";
    case "number":
      return "42";
    case "date":
      return "2026-11-25";
    case "email":
      return "hello@example.com";
    case "url":
      return "https://example.com";
    default:
      return "Sample value";
  }
}

export function CMSAccessView({
  projectId,
  onOpenMcp,
}: CMSAccessViewProps): React.ReactElement | null {
  const { selectedType, contentFields, updateTypeMutation } = useCMSContext();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [mcpMode, setMcpMode] = useState<McpPayloadMode>("list_items");
  const [copiedMcpPayload, setCopiedMcpPayload] = useState(false);

  if (!selectedType) {
    return null;
  }

  const publicRead = selectedType.publicRead ?? true;
  const publicCreate = selectedType.publicCreate ?? false;
  const defaultPublished = selectedType.defaultPublished ?? false;

  const effectiveProjectId = projectId ?? selectedType.projectId ?? "";
  const collectionRef = selectedType.slug || selectedType.id;
  const endpointUrl = effectiveProjectId
    ? buildPublicCollectionEndpoint(
        resolveApiOrigin(),
        effectiveProjectId,
        collectionRef,
      )
    : "";

  const snippet = endpointUrl
    ? `const response = await fetch("${endpointUrl}");\nconst { items } = await response.json();`
    : "";

  const sampleFields: Record<string, string> = Object.fromEntries(
    contentFields.map((field) => [
      field.name,
      sampleValueForFieldType(field.type),
    ]),
  );

  const mcpPayload = effectiveProjectId
    ? JSON.stringify(
        mcpMode === "list_items"
          ? {
              tool: "list_items",
              arguments: {
                projectId: effectiveProjectId,
                collection: collectionRef,
                publishedOnly: true,
                limit: 50,
              },
            }
          : {
              tool: "upsert_items",
              arguments: {
                projectId: effectiveProjectId,
                collection: collectionRef,
                items: [
                  {
                    title: "Example item",
                    slug: "example-item",
                    published: true,
                    fields: sampleFields,
                  },
                ],
              },
            },
        null,
        2,
      )
    : "";

  const handleToggle = (
    field: "publicRead" | "publicCreate" | "defaultPublished",
    value: boolean,
  ): void => {
    updateTypeMutation.mutate(
      { id: selectedType.id, data: { [field]: value } },
      {
        onSuccess: () => toast.success("Collection access policy updated"),
        onError: () => toast.error("Failed to update access policy"),
      },
    );
  };

  const handleCopyUrl = async (): Promise<void> => {
    if (!endpointUrl) {
      return;
    }
    await navigator.clipboard.writeText(endpointUrl);
    setCopiedUrl(true);
    toast.success("Public API URL copied");
    window.setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopySnippet = async (): Promise<void> => {
    if (!snippet) {
      return;
    }
    await navigator.clipboard.writeText(snippet);
    setCopiedSnippet(true);
    toast.success("Fetch snippet copied");
    window.setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleCopyMcpPayload = async (): Promise<void> => {
    if (!mcpPayload) {
      return;
    }
    try {
      await navigator.clipboard.writeText(mcpPayload);
      setCopiedMcpPayload(true);
      toast.success("MCP payload copied");
      window.setTimeout(() => setCopiedMcpPayload(false), 2000);
    } catch {
      toast.error("Could not copy MCP payload");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Globe className="size-4 text-muted-foreground" />
            Access Policy
          </h3>
          <div className="divide-y divide-border/50 rounded-xl border border-border/60 bg-card/40">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <Label
                  htmlFor="cms-access-public-read"
                  className="text-sm font-medium"
                >
                  Public Read
                </Label>
                <span className="text-xs text-muted-foreground">
                  Allow published items in this collection to be fetched over
                  the public GET API.
                </span>
              </div>
              <Switch
                id="cms-access-public-read"
                checked={publicRead}
                onCheckedChange={(checked) =>
                  handleToggle("publicRead", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <Label
                  htmlFor="cms-access-public-create"
                  className="text-sm font-medium"
                >
                  Public Form Submit
                </Label>
                <span className="text-xs text-muted-foreground">
                  Accept unauthenticated POST submissions from published site
                  forms.
                </span>
              </div>
              <Switch
                id="cms-access-public-create"
                checked={publicCreate}
                onCheckedChange={(checked) =>
                  handleToggle("publicCreate", checked)
                }
              />
            </div>

            {publicCreate && (
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex flex-col gap-0.5">
                  <Label
                    htmlFor="cms-access-default-published"
                    className="text-sm font-medium"
                  >
                    Auto-Publish Submissions
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Immediately publish new public submissions instead of saving
                    them as drafts.
                  </span>
                </div>
                <Switch
                  id="cms-access-default-published"
                  checked={defaultPublished}
                  onCheckedChange={(checked) =>
                    handleToggle("defaultPublished", checked)
                  }
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Terminal className="size-4 text-muted-foreground" />
            Public API Endpoint
          </h3>
          <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-5">
            {endpointUrl ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  {publicRead && (
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      GET
                    </Badge>
                  )}
                  {publicCreate && (
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      POST
                    </Badge>
                  )}
                  {!publicRead && !publicCreate && (
                    <Badge variant="outline" className="text-[10px]">
                      Private
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-lg border border-border/60 bg-background px-3 py-2 font-mono text-xs text-foreground">
                    {endpointUrl}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5"
                    onClick={() => void handleCopyUrl()}
                  >
                    {copiedUrl ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    {copiedUrl ? "Copied" : "Copy"}
                  </Button>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Quick fetch example
                    </span>
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      className="gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => void handleCopySnippet()}
                    >
                      {copiedSnippet ? (
                        <Check className="size-3" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      {copiedSnippet ? "Copied" : "Copy code"}
                    </Button>
                  </div>
                  <pre className="overflow-x-auto rounded-lg border border-border/60 bg-background p-3 font-mono text-xs leading-relaxed text-foreground">
                    <code>{snippet}</code>
                  </pre>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Save or open this collection inside a project to view its public
                API endpoint.
              </p>
            )}
          </div>
        </div>

        {effectiveProjectId && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="size-4 text-muted-foreground" />
                MCP Tool Payloads
              </h3>
              {onOpenMcp && (
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={onOpenMcp}
                >
                  <Terminal className="size-3" />
                  Connect MCP
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1 rounded-lg bg-muted/60 p-1">
                  <button
                    type="button"
                    onClick={() => setMcpMode("list_items")}
                    className={cn(
                      "rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-colors",
                      mcpMode === "list_items"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    list_items
                  </button>
                  <button
                    type="button"
                    onClick={() => setMcpMode("upsert_items")}
                    className={cn(
                      "rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-colors",
                      mcpMode === "upsert_items"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    upsert_items
                  </button>
                </div>

                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  className="gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() => void handleCopyMcpPayload()}
                >
                  {copiedMcpPayload ? (
                    <Check className="size-3" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  {copiedMcpPayload ? "Copied" : "Copy payload"}
                </Button>
              </div>

              <pre className="overflow-x-auto rounded-lg border border-border/60 bg-background p-3 font-mono text-xs leading-relaxed text-foreground">
                <code>{mcpPayload}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
