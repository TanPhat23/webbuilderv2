import React, { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCMSContext } from "../provider/CMSProvider";
import { buildPublicCollectionEndpoint } from "../services/webhook.service";

interface CollectionAccessBarProps {
  readonly projectId?: string;
}

function resolveApiOrigin(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  return typeof envUrl === "string" && envUrl.length > 0
    ? envUrl
    : "http://localhost:8080";
}

export function CollectionAccessBar({
  projectId,
}: CollectionAccessBarProps): React.ReactElement | null {
  const { selectedType, updateTypeMutation } = useCMSContext();
  const [copied, setCopied] = useState(false);

  if (!selectedType) {
    return null;
  }

  const publicRead = selectedType.publicRead ?? true;
  const publicCreate = selectedType.publicCreate ?? false;
  const defaultPublished = selectedType.defaultPublished ?? false;

  const effectiveProjectId = projectId ?? selectedType.projectId ?? "";
  const endpointUrl = effectiveProjectId
    ? buildPublicCollectionEndpoint(
        resolveApiOrigin(),
        effectiveProjectId,
        selectedType.slug || selectedType.id,
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
    if (!endpointUrl) return;
    await navigator.clipboard.writeText(endpointUrl);
    setCopied(true);
    toast.success("Public API URL copied");
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-2 text-xs">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
          <Globe className="size-3.5" />
          <span>API Access</span>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="cms-public-read"
            checked={publicRead}
            onCheckedChange={(checked) => handleToggle("publicRead", checked)}
          />
          <Label htmlFor="cms-public-read" className="text-xs font-normal">
            Public Read
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="cms-public-create"
            checked={publicCreate}
            onCheckedChange={(checked) => handleToggle("publicCreate", checked)}
          />
          <Label htmlFor="cms-public-create" className="text-xs font-normal">
            Public Form Submit
          </Label>
        </div>

        {publicCreate && (
          <div className="flex items-center gap-2">
            <Switch
              id="cms-default-published"
              checked={defaultPublished}
              onCheckedChange={(checked) =>
                handleToggle("defaultPublished", checked)
              }
            />
            <Label
              htmlFor="cms-default-published"
              className="text-xs font-normal"
            >
              Auto-Publish Submissions
            </Label>
          </div>
        )}
      </div>

      {endpointUrl && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 font-mono text-[11px]"
          onClick={() => void handleCopyUrl()}
        >
          {copied ? (
            <Check className="size-3" />
          ) : (
            <Copy className="size-3" />
          )}
          Copy Endpoint
        </Button>
      )}
    </div>
  );
}
