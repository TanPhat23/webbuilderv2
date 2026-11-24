import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/tanstack-react-start";
import { toast } from "sonner";
import { Terminal, Copy, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  agentTokenService,
  type AgentTokenInfo,
  type CreatedAgentToken,
} from "../services/agentTokens.service";
import {
  antigravityConfig,
  claudeCodeCommand,
  codexCommand,
  connectionStatus,
  openCodeConfig,
} from "../connectCommands";
import { useAgentActivity } from "../activity";

const copy = (text: string) =>
  navigator.clipboard
    .writeText(text)
    .then(
      () => toast.success("Copied"),
      () => toast.error("Could not copy"),
    );

type McpClientId = "claude" | "codex" | "antigravity" | "opencode";

interface McpClientOption {
  readonly id: McpClientId;
  readonly label: string;
  readonly hint: string;
  readonly multiline: boolean;
  readonly buildSnippet: (mcpUrl: string, token: string) => string;
}

const MCP_CLIENTS: readonly McpClientOption[] = [
  {
    id: "claude",
    label: "Claude Code",
    hint: "Run in your terminal to register the HTTP MCP server.",
    multiline: false,
    buildSnippet: claudeCodeCommand,
  },
  {
    id: "codex",
    label: "Codex",
    hint: "Run in your terminal, then start Codex from the same shell.",
    multiline: false,
    buildSnippet: codexCommand,
  },
  {
    id: "antigravity",
    label: "Antigravity",
    hint: "Add to ~/.gemini/config/mcp_config.json (or your plugin mcp_config.json).",
    multiline: true,
    buildSnippet: antigravityConfig,
  },
  {
    id: "opencode",
    label: "OpenCode",
    hint: "Add to opencode.json in your project root or ~/.config/opencode/opencode.json.",
    multiline: true,
    buildSnippet: openCodeConfig,
  },
];

function CommandBlock({
  label,
  text,
  multiline = false,
}: {
  label: string;
  text: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="text-muted-foreground text-xs font-medium">{label}</div>
        <Button
          size="icon"
          variant="ghost"
          className="size-6 shrink-0"
          aria-label={`Copy ${label} setup`}
          onClick={() => copy(text)}
        >
          <Copy className="size-3" />
        </Button>
      </div>
      <div className="bg-muted/40 overflow-x-auto rounded-md border p-2">
        {multiline ? (
          <pre className="font-mono text-[11px] leading-snug" tabIndex={0}>
            <code>{text}</code>
          </pre>
        ) : (
          <code className="block font-mono text-xs whitespace-nowrap" tabIndex={0}>
            {text}
          </code>
        )}
      </div>
    </div>
  );
}

function CreatedCommandsSection({
  created,
  onDone,
}: {
  created: CreatedAgentToken;
  onDone: () => void;
}) {
  const [clientId, setClientId] = useState<McpClientId>("claude");
  const activeClient =
    MCP_CLIENTS.find((client) => client.id === clientId) ?? MCP_CLIENTS[0];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium">
        Copy this now. The token will not be shown again.
      </p>

      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted/50 p-1">
        {MCP_CLIENTS.map((client) => (
          <button
            key={client.id}
            type="button"
            onClick={() => setClientId(client.id)}
            className={cn(
              "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
              client.id === activeClient.id
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {client.label}
          </button>
        ))}
      </div>

      <CommandBlock
        label={activeClient.label}
        text={activeClient.buildSnippet(created.mcpUrl, created.token)}
        multiline={activeClient.multiline}
      />

      <p className="text-muted-foreground text-[11px] leading-relaxed">
        {activeClient.hint}
      </p>

      <Button variant="outline" size="sm" onClick={onDone} className="w-fit">
        Done
      </Button>
    </div>
  );
}

function AgentTokenList({
  tokens,
  onRevoke,
}: {
  tokens: readonly AgentTokenInfo[];
  onRevoke: (id: string) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="text-muted-foreground text-xs font-medium">
        Your tokens
      </div>
      {tokens.length === 0 && (
        <p className="text-muted-foreground text-sm">None yet.</p>
      )}
      {tokens.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between gap-2 rounded-md border px-2 py-1 text-sm"
        >
          <span className="min-w-0">
            {t.name}{" "}
            <span className="text-muted-foreground text-xs">
              {t.prefix}…
              {t.lastUsedAt
                ? ` · used ${new Date(t.lastUsedAt).toLocaleString()}`
                : " · never used"}
            </span>
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0"
            aria-label={`Revoke ${t.name}`}
            onClick={() => onRevoke(t.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}

/**
 * Inline "connect your CLI" card for the AI panel. Lets Claude Code or Codex
 * CLI read the user's projects and edit the open page.
 */
export default function ConnectCliPanel() {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [tokens, setTokens] = useState<AgentTokenInfo[]>([]);
  const [name, setName] = useState("My laptop");
  const [created, setCreated] = useState<CreatedAgentToken | null>(null);
  const lastAt = useAgentActivity((s) => s.lastAt);
  const editing = useAgentActivity((s) => s.editing);
  const status = connectionStatus(editing, lastAt);

  const refresh = useCallback(async () => {
    try {
      setTokens(await agentTokenService.list((await getToken()) ?? undefined));
    } catch {
      toast.error("Could not load your tokens.");
    }
  }, [getToken]);
  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  const create = async () => {
    try {
      setCreated(
        await agentTokenService.create(name, (await getToken()) ?? undefined),
      );
      void refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not create the token.",
      );
    }
  };
  const revoke = async (id: string) => {
    try {
      await agentTokenService.revoke(id, (await getToken()) ?? undefined);
      await refresh();
    } catch {
      toast.error("Could not revoke the token.");
    }
  };

  return (
    <Collapsible
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setCreated(null);
      }}
      className="border-border/60 bg-card/40 rounded-lg border"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="hover:bg-muted/60 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
        >
          <span className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
            <Terminal className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-foreground block text-sm font-medium">
              Connect your CLI
            </span>
            <span className="text-muted-foreground flex items-center gap-1.5 truncate text-xs">
              <span className={cn("size-1.5 shrink-0 rounded-full", status.dot)} />
              <span className="truncate">
                {status.label} · Claude Code, Codex, Antigravity, OpenCode
              </span>
            </span>
          </span>
          <ChevronDown
            className={cn(
              "text-muted-foreground h-4 w-4 shrink-0 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="flex flex-col gap-4 px-3 pt-1 pb-3">
        <p className="text-muted-foreground text-xs">
          Let Claude Code, Codex, Antigravity, or OpenCode read your projects
          and edit the page you have open. Edits appear here as one undo step.
          Keep this project open in the builder while the agent works.
        </p>

        {created ? (
          <CreatedCommandsSection
            created={created}
            onDone={() => setCreated(null)}
          />
        ) : (
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              aria-label="Token name"
              className="h-8 text-sm"
            />
            <Button size="sm" onClick={create} disabled={!name.trim()}>
              Create token
            </Button>
          </div>
        )}

        <AgentTokenList tokens={tokens} onRevoke={revoke} />
      </CollapsibleContent>
    </Collapsible>
  );
}
