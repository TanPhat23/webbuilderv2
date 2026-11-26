import React from "react";
import { Database, Route, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDynamicPagePreview } from "@/features/editor/hooks/useDynamicPagePreview";

export function DynamicPagePreviewBar(): React.JSX.Element | null {
  const {
    isDynamic,
    isCatchAll,
    patternPath,
    previewPath,
    contentTypeId,
    paramNames,
    params,
    items,
    isLoadingItems,
    selectedItem,
    setSelectedItemSlug,
    setSampleParam,
  } = useDynamicPagePreview();

  if (!isDynamic) return null;

  const primaryCmsParam = contentTypeId
    ? paramNames.includes("slug")
      ? "slug"
      : paramNames[0]
    : undefined;
  const editableParams = contentTypeId
    ? paramNames.filter((name) => name !== primaryCmsParam)
    : paramNames;

  const tokenExamples = contentTypeId
    ? ["title", "slug", ...editableParams].slice(0, 3)
    : paramNames.slice(0, 3);

  return (
    <div
      className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-muted/35 px-3 py-1.5 text-xs"
      data-testid="dynamic-page-preview-bar"
    >
      <div className="flex items-center gap-1.5">
        <Badge
          variant="secondary"
          className="h-5 gap-1 px-1.5 font-mono text-[10px] font-medium uppercase"
        >
          {contentTypeId ? (
            <Database className="h-3 w-3" />
          ) : (
            <Route className="h-3 w-3" />
          )}
          {contentTypeId ? "CMS" : isCatchAll ? "Catch-All" : "Dynamic"}
        </Badge>
        <span className="font-mono text-[11px] text-muted-foreground">
          {patternPath}
        </span>
      </div>

      {contentTypeId && (
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">Preview item:</span>
          {isLoadingItems ? (
            <span className="text-[11px] text-muted-foreground">Loading…</span>
          ) : items.length === 0 ? (
            <span className="text-[11px] text-muted-foreground">
              No items in collection
            </span>
          ) : (
            <Select
              value={selectedItem?.slug ?? ""}
              onValueChange={setSelectedItemSlug}
            >
              <SelectTrigger
                aria-label="Preview CMS item"
                className="h-6 min-w-[160px] max-w-[240px] bg-background px-2 text-[11px]"
              >
                <SelectValue placeholder="Choose item" />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.slug}>
                    <span className="truncate">{item.title || item.slug}</span>
                    <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                      /{item.slug}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {editableParams.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {editableParams.map((name) => (
            <label key={name} className="flex items-center gap-1">
              <span className="font-mono text-[10px] text-muted-foreground">
                {name === "*" ? "*" : `:${name}`}
              </span>
              <Input
                value={params[name] ?? ""}
                onChange={(event) => setSampleParam(name, event.target.value)}
                aria-label={`Sample value for ${name}`}
                placeholder={name === "*" ? "docs/intro" : `sample-${name}`}
                className="h-6 w-28 bg-background px-2 font-mono text-[11px]"
              />
            </label>
          ))}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
        <span
          className="hidden items-center gap-1 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] ring-1 ring-border sm:inline-flex"
          title="Resolved preview URL"
        >
          {previewPath}
        </span>
        {tokenExamples.length > 0 && (
          <span
            className="hidden items-center gap-1 lg:inline-flex"
            title="Use these placeholders in Text, Heading, Link, Button, or Image elements"
          >
            <Sparkles className="h-3 w-3 opacity-70" />
            {tokenExamples.map((token) => (
              <code
                key={token}
                className="rounded bg-muted px-1 font-mono text-[10px]"
              >
                {`{{${token}}}`}
              </code>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
