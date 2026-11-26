import { useState, type ChangeEvent, type ReactElement } from "react";
import { Check, Copy, ExternalLink, Globe, Info, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  buildPublicSiteUrl,
  isValidSubdomainLabel,
} from "@webbuilder/site-runtime/routing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface GeneralTabProps {
  readonly projectName: string;
  readonly projectDescription: string;
  readonly isPublished: boolean;
  readonly subdomain: string;
  readonly canEdit: boolean;
  readonly canPublish: boolean;
  readonly canManageSubdomain: boolean;
  readonly onProjectNameChange: (value: string) => void;
  readonly onProjectDescriptionChange: (value: string) => void;
  readonly onPublishedChange: (value: boolean) => void;
  readonly onSubdomainChange: (value: string) => void;
}

export function GeneralTab({
  projectName,
  projectDescription,
  isPublished,
  subdomain,
  canEdit,
  canPublish,
  canManageSubdomain,
  onProjectNameChange,
  onProjectDescriptionChange,
  onPublishedChange,
  onSubdomainChange,
}: GeneralTabProps): ReactElement {
  const [copied, setCopied] = useState(false);
  const isNameInvalid = projectName.trim().length === 0;
  const isPublishingLocked = !canPublish && !canManageSubdomain;
  const cleanSubdomain = subdomain.trim().toLowerCase();
  const isSubdomainValid = cleanSubdomain.length === 0 || isValidSubdomainLabel(cleanSubdomain);
  const previewUrl = buildPublicSiteUrl(cleanSubdomain || "my-site");
  const canOpenLive = isPublished && cleanSubdomain.length > 0 && isValidSubdomainLabel(cleanSubdomain);

  const handleCopyUrl = (): void => {
    if (typeof navigator === "undefined" || !cleanSubdomain) return;
    void navigator.clipboard.writeText(previewUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Identity</CardTitle>
          <CardDescription>
            Update the name and description shown in your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="project-name">Project Name</Label>
              {isNameInvalid && (
                <span className="text-xs font-medium text-destructive">
                  Required
                </span>
              )}
            </div>
            <Input
              id="project-name"
              value={projectName}
              disabled={!canEdit}
              aria-invalid={isNameInvalid}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onProjectNameChange(event.target.value)
              }
              placeholder="My Website Project"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={projectDescription}
              disabled={!canEdit}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                onProjectDescriptionChange(event.target.value)
              }
              placeholder="Describe what this site is for..."
              className="min-h-24 resize-y"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="size-4 text-primary" />
              Publishing &amp; Domain
            </CardTitle>
            <Badge variant={isPublished ? "default" : "secondary"}>
              {isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
          <CardDescription>
            Control public site visibility and your project subdomain.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isPublishingLocked && (
            <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
              <Lock className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Only the project owner can change publishing status or subdomain settings.
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="project-published" className="text-sm font-medium">
                Publish Site
              </Label>
              <span className="text-xs text-muted-foreground">
                Make your published pages accessible on the web.
              </span>
            </div>
            <Switch
              id="project-published"
              checked={isPublished}
              disabled={!canPublish}
              onCheckedChange={onPublishedChange}
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="project-subdomain">Subdomain</Label>
              {!isSubdomainValid && (
                <span className="text-xs font-medium text-destructive">
                  Must be 3–63 chars (a-z, 0-9, single -)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="project-subdomain"
                value={subdomain}
                disabled={!canManageSubdomain}
                aria-invalid={!isSubdomainValid}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  onSubdomainChange(event.target.value)
                }
                placeholder="my-site"
                className="font-mono text-sm"
              />
              {cleanSubdomain && isSubdomainValid && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Copy site URL"
                  onClick={handleCopyUrl}
                  className="shrink-0"
                >
                  {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                </Button>
              )}
              {canOpenLive && (
                <Button
                  asChild
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                >
                  <a href={previewUrl} target="_blank" rel="noreferrer">
                    Open
                    <ExternalLink className="size-3.5" />
                  </a>
                </Button>
              )}
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="size-3.5 shrink-0" />
              <span className="truncate font-mono">{previewUrl}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
