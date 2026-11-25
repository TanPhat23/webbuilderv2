import React, { useState } from "react";
import { toast } from "sonner";
import {
  Check,
  Copy,
  Plus,
  Send,
  Trash2,
  Webhook as WebhookIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateProjectWebhook,
  useDeleteProjectWebhook,
  useProjectWebhooks,
  useSendTestWebhook,
  useUpdateProjectWebhook,
  useWebhookDeliveries,
} from "../hooks/useProjectWebhooks";
import { useCMSContentTypes } from "../hooks/useCMSContent";
import {
  WEBHOOK_EVENTS,
  type ProjectWebhook,
  type WebhookEvent,
} from "../interfaces/webhook.interface";

interface WebhooksTabProps {
  readonly projectId?: string;
}

function DeliveryList({
  projectId,
  webhookId,
}: {
  readonly projectId: string;
  readonly webhookId: string;
}): React.ReactElement {
  const { data: deliveries = [], isLoading } = useWebhookDeliveries(
    projectId,
    webhookId,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }
  if (deliveries.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No deliveries yet. Click Send Test or submit a form to trigger one.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {deliveries.map((d) => (
        <div
          key={d.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs"
        >
          <div className="flex items-center gap-2">
            <Badge
              variant={
                d.status === "succeeded"
                  ? "default"
                  : d.status === "failed"
                    ? "destructive"
                    : "secondary"
              }
              className="text-[10px]"
            >
              {d.status}
            </Badge>
            <span className="font-mono text-[11px]">{d.event}</span>
            {d.httpStatus != null && (
              <span className="font-mono text-[11px] text-muted-foreground">
                HTTP {d.httpStatus}
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {d.attempts} {d.attempts === 1 ? "attempt" : "attempts"}
          </span>
        </div>
      ))}
    </div>
  );
}

export function WebhooksTab({
  projectId,
}: WebhooksTabProps): React.ReactElement {
  const { data: webhooks = [], isLoading } = useProjectWebhooks(projectId);
  const { data: collections = [] } = useCMSContentTypes(projectId);
  const createWebhook = useCreateProjectWebhook(projectId);
  const updateWebhook = useUpdateProjectWebhook(projectId);
  const deleteWebhook = useDeleteProjectWebhook(projectId);
  const sendTest = useSendTestWebhook(projectId);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [collectionId, setCollectionId] = useState("__all__");
  const [events, setEvents] = useState<WebhookEvent[]>(["item.created"]);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!projectId) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Open a project to configure webhooks.
      </div>
    );
  }

  const toggleEvent = (ev: WebhookEvent): void => {
    setEvents((prev) =>
      prev.includes(ev) ? prev.filter((item) => item !== ev) : [...prev, ev],
    );
  };

  const handleCreate = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || events.length === 0) {
      toast.error("Name, URL, and at least one event are required.");
      return;
    }
    try {
      const created = await createWebhook.mutateAsync({
        name: name.trim(),
        url: url.trim(),
        events,
        contentTypeId: collectionId === "__all__" ? undefined : collectionId,
      });
      setCreatedSecret(created.secret ?? null);
      setName("");
      setUrl("");
      setCollectionId("__all__");
      toast.success("Webhook created");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create webhook",
      );
    }
  };

  const handleCopySecret = async (): Promise<void> => {
    if (!createdSecret) return;
    await navigator.clipboard.writeText(createdSecret);
    setCopiedSecret(true);
    toast.success("Signing secret copied");
    window.setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleToggleEnabled = async (wh: ProjectWebhook): Promise<void> => {
    try {
      await updateWebhook.mutateAsync({
        webhookId: wh.id,
        input: { enabled: !wh.enabled },
      });
    } catch {
      toast.error("Failed to update webhook");
    }
  };

  const handleTest = async (webhookId: string): Promise<void> => {
    try {
      const delivery = await sendTest.mutateAsync(webhookId);
      setExpandedId(webhookId);
      if (delivery.status === "succeeded") {
        toast.success(`Test delivered (HTTP ${delivery.httpStatus ?? 200})`);
      } else {
        toast.error(
          `Test failed: ${delivery.errorMessage ?? delivery.status}`,
        );
      }
    } catch {
      toast.error("Failed to send test webhook");
    }
  };

  const handleDelete = async (webhookId: string): Promise<void> => {
    try {
      await deleteWebhook.mutateAsync(webhookId);
      toast.success("Webhook deleted");
    } catch {
      toast.error("Failed to delete webhook");
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <WebhookIcon className="size-4 text-muted-foreground" />
            Project Webhooks
          </h3>
          <p className="text-xs text-muted-foreground">
            Send signed HMAC-SHA256 HTTP POST requests when collection items or
            public forms are created, updated, or deleted.
          </p>
        </div>

        {createdSecret && (
          <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/40 p-4">
            <p className="text-xs font-medium">
              Signing secret (shown once — save it to verify{" "}
              <code className="font-mono">X-WebBuilder-Signature</code>):
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md border border-border/60 bg-background px-2.5 py-1.5 font-mono text-xs">
                {createdSecret}
              </code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void handleCopySecret()}
              >
                {copiedSecret ? (
                  <Check className="size-3.5" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => void handleCreate(e)}
          className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-4"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wh-name" className="text-xs">
                Name
              </Label>
              <Input
                id="wh-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Slack catering alerts"
                className="h-8 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wh-url" className="text-xs">
                Endpoint URL
              </Label>
              <Input
                id="wh-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://hooks.example.com/webbuilder"
                className="h-8 font-mono text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wh-col" className="text-xs">
                Collection Scope
              </Label>
              <Select value={collectionId} onValueChange={setCollectionId}>
                <SelectTrigger id="wh-col" className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="__all__">All collections</SelectItem>
                    {collections.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {WEBHOOK_EVENTS.map((ev) => {
                const active = events.includes(ev.value);
                return (
                  <Button
                    key={ev.value}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className="h-7 text-xs"
                    onClick={() => toggleEvent(ev.value)}
                  >
                    {ev.value}
                  </Button>
                );
              })}
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={createWebhook.isPending}
              className="h-8 gap-1.5 text-xs"
            >
              <Plus className="size-3.5" />
              Add Webhook
            </Button>
          </div>
        </form>

        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[0, 1].map((idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2.5 rounded-xl border border-border/60 bg-card/40 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-9 rounded-full" />
                      <Skeleton className="h-7 w-16" />
                      <Skeleton className="h-7 w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : webhooks.length === 0 ? (
            <Empty className="rounded-xl border border-dashed border-border/70 bg-card/30 py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <WebhookIcon className="size-5" />
                </EmptyMedia>
                <EmptyTitle className="text-base">
                  No webhooks configured
                </EmptyTitle>
                <EmptyDescription>
                  Add a webhook above to receive signed HTTP POST notifications
                  when collection items or public forms change.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            webhooks.map((wh) => (
              <div
                key={wh.id}
                className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{wh.name}</span>
                      {wh.events.map((ev) => (
                        <Badge
                          key={ev}
                          variant="secondary"
                          className="font-mono text-[10px]"
                        >
                          {ev}
                        </Badge>
                      ))}
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {wh.url}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={wh.enabled}
                      onCheckedChange={() => void handleToggleEnabled(wh)}
                      aria-label={`Toggle ${wh.name}`}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 text-xs"
                      disabled={sendTest.isPending}
                      onClick={() => void handleTest(wh.id)}
                    >
                      <Send className="size-3" />
                      Test
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() =>
                        setExpandedId((prev) =>
                          prev === wh.id ? null : wh.id,
                        )
                      }
                    >
                      {expandedId === wh.id ? "Hide Logs" : "Logs"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-destructive"
                      onClick={() => void handleDelete(wh.id)}
                      aria-label={`Delete ${wh.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                {expandedId === wh.id && (
                  <DeliveryList projectId={projectId} webhookId={wh.id} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
