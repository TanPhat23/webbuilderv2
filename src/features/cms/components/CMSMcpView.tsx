import React, { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Plug, Terminal, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CMSMcpViewProps {
  readonly projectId?: string;
  readonly mcpConnectPanel?: React.ReactNode;
}

type McpToolCategory = "CMS" | "Webhooks";

interface McpToolDoc {
  readonly name: string;
  readonly category: McpToolCategory;
  readonly description: string;
}

const CMS_MCP_TOOLS: readonly McpToolDoc[] = [
  {
    name: "list_collections",
    category: "CMS",
    description:
      "List all CMS collections and their schemas in this project.",
  },
  {
    name: "create_collection",
    category: "CMS",
    description:
      "Create a new collection with typed fields and public access settings.",
  },
  {
    name: "list_items",
    category: "CMS",
    description: "Query items in a collection with flattened field values.",
  },
  {
    name: "upsert_items",
    category: "CMS",
    description: "Create or update collection items by id or slug.",
  },
  {
    name: "create_webhook",
    category: "Webhooks",
    description:
      "Register a signed HMAC-SHA256 webhook for collection events.",
  },
  {
    name: "list_webhook_deliveries",
    category: "Webhooks",
    description:
      "Inspect recent webhook delivery attempts and HTTP statuses.",
  },
];

function buildStarterCall(projectId?: string): string {
  return JSON.stringify(
    {
      tool: "list_collections",
      arguments: {
        projectId: projectId ?? "<project-id>",
      },
    },
    null,
    2,
  );
}

export function CMSMcpView({
  projectId,
  mcpConnectPanel,
}: CMSMcpViewProps): React.ReactElement {
  const [copiedStarter, setCopiedStarter] = useState(false);

  const starterCall = buildStarterCall(projectId);

  const handleCopyStarter = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(starterCall);
      setCopiedStarter(true);
      toast.success("MCP starter call copied");
      window.setTimeout(() => setCopiedStarter(false), 2000);
    } catch {
      toast.error("Could not copy starter call");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <section className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Plug className="size-4 text-muted-foreground" />
            Connect AI Agents
          </h3>
          <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-5">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Connect Claude Code, Codex, Antigravity, or OpenCode using your
              personal MCP token to inspect collections, upsert CMS items, and
              manage project webhooks directly from your coding agent.
            </p>
            {mcpConnectPanel ?? (
              <p className="text-xs text-muted-foreground">
                Open this project in the editor to generate or manage personal
                MCP tokens.
              </p>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Wrench className="size-4 text-muted-foreground" />
            Available CMS &amp; Webhook Tools
          </h3>
          <div className="divide-y divide-border/50 rounded-xl border border-border/60 bg-card/40">
            {CMS_MCP_TOOLS.map((tool) => (
              <div
                key={tool.name}
                className="flex flex-col gap-1.5 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="font-mono text-[11px] font-medium"
                  >
                    {tool.name}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {tool.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground sm:text-right">
                  {tool.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Terminal className="size-4 text-muted-foreground" />
              Starter Tool Call
            </h3>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="gap-1 text-muted-foreground hover:text-foreground"
              onClick={() => void handleCopyStarter()}
            >
              {copiedStarter ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
              {copiedStarter ? "Copied" : "Copy call"}
            </Button>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/40 p-5">
            <pre className="overflow-x-auto rounded-lg border border-border/60 bg-background p-3 font-mono text-xs leading-relaxed text-foreground">
              <code>{starterCall}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
