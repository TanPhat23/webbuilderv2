import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/tanstack-react-start";
import { toast } from "sonner";
import { Terminal, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { agentTokenService, type AgentTokenInfo, type CreatedAgentToken } from "../services/agentTokens.service";
import { claudeCodeCommand, codexCommands } from "../connectCommands";
import { useAgentActivity } from "../activity";

const copy = (text: string) =>
  navigator.clipboard.writeText(text).then(() => toast.success("Copied"), () => toast.error("Could not copy"));

function CommandBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex items-start gap-2 rounded-md border bg-muted/40 p-2">
        <code className="flex-1 break-all text-xs">{text}</code>
        <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" aria-label={`Copy ${label} command`} onClick={() => copy(text)}><Copy className="h-3 w-3" /></Button>
      </div>
    </div>
  );
}

export default function ConnectCliButton() {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [tokens, setTokens] = useState<AgentTokenInfo[]>([]);
  const [name, setName] = useState("My laptop");
  const [created, setCreated] = useState<CreatedAgentToken | null>(null);
  const lastAt = useAgentActivity((s) => s.lastAt);
  const editing = useAgentActivity((s) => s.editing);
  const recent = lastAt !== null && Date.now() - lastAt < 5 * 60_000;

  const refresh = useCallback(async () => {
    try { setTokens(await agentTokenService.list((await getToken()) ?? undefined)); }
    catch { toast.error("Could not load your tokens."); }
  }, [getToken]);
  useEffect(() => { if (open) void refresh(); }, [open, refresh]);

  const create = async () => {
    try {
      setCreated(await agentTokenService.create(name, (await getToken()) ?? undefined));
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the token.");
    }
  };
  const revoke = async (id: string) => {
    try { await agentTokenService.revoke(id, (await getToken()) ?? undefined); await refresh(); }
    catch { toast.error("Could not revoke the token."); }
  };

  const codex = created ? codexCommands(created.mcpUrl) : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setCreated(null); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1" aria-label="Connect your CLI">
          <Terminal className="h-4 w-4" />
          {editing ? "CLI editing…" : recent ? "CLI connected" : "CLI"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Connect your CLI</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          Let Claude Code or Codex CLI read your projects and edit the page you have open. Edits appear here as one undo step. Keep this project open in the builder while the CLI works.
        </p>

        {created ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Copy this now. It will not be shown again.</p>
            <CommandBlock label="Claude Code" text={claudeCodeCommand(created.mcpUrl, created.token)} />
            <CommandBlock label="Codex CLI, step 1" text={codex!.export(created.token)} />
            <CommandBlock label="Codex CLI, step 2" text={codex!.add} />
            <Button variant="outline" onClick={() => setCreated(null)}>Done</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} aria-label="Token name" />
            <Button onClick={create} disabled={!name.trim()}>Create token</Button>
          </div>
        )}

        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Your tokens</div>
          {tokens.length === 0 && <p className="text-sm text-muted-foreground">None yet.</p>}
          {tokens.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-md border px-2 py-1 text-sm">
              <span>{t.name} <span className="text-xs text-muted-foreground">{t.prefix}…{t.lastUsedAt ? ` · used ${new Date(t.lastUsedAt).toLocaleString()}` : " · never used"}</span></span>
              <Button size="icon" variant="ghost" className="h-6 w-6" aria-label={`Revoke ${t.name}`} onClick={() => revoke(t.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
