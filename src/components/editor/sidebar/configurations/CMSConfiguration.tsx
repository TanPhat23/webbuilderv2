"use client";

import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import { CMSContentSettings } from "@/interfaces/elements.interface";
import { useCMSContentTypes, useCMSContent } from "@/hooks";
import {
  ConfigField,
  ConfigSection,
  ConfigEmpty,
  SectionDivider,
} from "./_shared";
import { cn } from "@/lib/utils";
import {
  Database,
  LayoutList,
  LayoutGrid,
  SortAsc,
  SortDesc,
  Hash,
  FileText,
  Filter,
  Columns3,
  ArrowUpDown,
  Loader2,
  CheckSquare,
  Eye,
  Image as ImageIcon,
  User,
  Calendar,
  Type,
  AlignLeft,
} from "lucide-react";

/* ─── Field Icon Map ─── */

const FIELD_ICONS: Record<string, React.ReactNode> = {
  title: <Type className="h-3 w-3" />,
  excerpt: <AlignLeft className="h-3 w-3" />,
  content: <FileText className="h-3 w-3" />,
  image: <ImageIcon className="h-3 w-3" />,
  author: <User className="h-3 w-3" />,
  date: <Calendar className="h-3 w-3" />,
};

const DISPLAY_FIELDS = [
  "title",
  "excerpt",
  "content",
  "image",
  "author",
  "date",
];

/* ─── Main Component ─── */

const CMSConfiguration: React.FC = () => {
  const selectedElement = useSelectedElement();
  const updateElement = useUpdateElement();
  const element = selectedElement;

  if (!element) return null;

  const settings = (element.settings as CMSContentSettings) || {};
  const isListOrGrid =
    element.type === "CMSContentList" || element.type === "CMSContentGrid";
  const isItem = element.type === "CMSContentItem";
  const isGrid = element.type === "CMSContentGrid";

  const { data: contentTypes = [], isLoading: isLoadingTypes } =
    useCMSContentTypes();

  const { contentItems, isLoading: isLoadingItems } = useCMSContent({
    contentTypeId: settings.contentTypeId,
    enabled: !!settings.contentTypeId && isItem,
  });

  const updateSettings = (newSettings: Partial<CMSContentSettings>) => {
    updateElement(element.id, {
      settings: { ...settings, ...newSettings },
    });
  };

  /* ─── Derived State ─── */

  const selectedContentType = contentTypes.find(
    (ct) => ct.id === settings.contentTypeId,
  );
  const activeFieldCount =
    settings.fieldsToShow?.length ??
    DISPLAY_FIELDS.filter((f) => ["title", "content"].includes(f)).length;

  return (
    <AccordionItem value="cms-config" className="border-border/40">
      <AccordionTrigger
        className={cn(
          "group/trigger gap-2 py-2 hover:no-underline",
          "transition-colors duration-150",
          "hover:bg-muted/30 rounded-md px-1.5 -mx-1.5",
          "text-xs font-semibold text-foreground/90",
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150">
            <Database className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">CMS Content</span>
          {selectedContentType && (
            <span className="ml-auto mr-1 shrink-0">
              <Badge
                variant="secondary"
                className="h-4 px-1.5 text-[9px] font-medium"
              >
                {selectedContentType.name}
              </Badge>
            </span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-3 pt-1 px-0.5">
        <div className="flex flex-col gap-3">
          {/* ── Content Type Selection ── */}
          <ConfigSection
            title="Data Source"
            icon={<Database className="h-3 w-3" />}
          >
            <ConfigField
              label="Content Type"
              htmlFor="contentTypeId"
              hint="Choose the content type to display from your CMS."
            >
              <Select
                value={settings.contentTypeId || ""}
                onValueChange={(value) =>
                  updateSettings({ contentTypeId: value })
                }
                disabled={isLoadingTypes}
              >
                <SelectTrigger
                  id="contentTypeId"
                  className={cn(
                    "h-7 w-[140px] px-2 text-[11px] rounded-md",
                    isLoadingTypes && "animate-pulse",
                  )}
                >
                  {isLoadingTypes ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select type..." />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((contentType) => (
                    <SelectItem key={contentType.id} value={contentType.id}>
                      <div className="flex items-center gap-2">
                        <Database className="h-3 w-3 text-muted-foreground" />
                        <span>{contentType.name || contentType.id}</span>
                      </div>
                    </SelectItem>
                  ))}
                  {contentTypes.length === 0 && !isLoadingTypes && (
                    <SelectItem value="__empty__" disabled>
                      <span className="text-muted-foreground">
                        No content types available
                      </span>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </ConfigField>

            {/* Content type status */}
            {!settings.contentTypeId && !isLoadingTypes && (
              <ConfigEmpty
                icon={<Database className="h-5 w-5" />}
                message="Select a content type to configure this component"
              />
            )}

            {selectedContentType && (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-medium">
                  <Database className="h-2.5 w-2.5" />
                  {selectedContentType.name}
                </span>
              </div>
            )}
          </ConfigSection>

          {/* ── Item Slug (single item) ── */}
          {isItem && settings.contentTypeId && (
            <>
              <SectionDivider />

              <ConfigSection
                title="Item Selection"
                icon={<FileText className="h-3 w-3" />}
              >
                <ConfigField
                  label="Item"
                  htmlFor="itemSlug"
                  hint="Choose the specific content item to display."
                >
                  <Select
                    value={settings.itemSlug || ""}
                    onValueChange={(value) =>
                      updateSettings({ itemSlug: value })
                    }
                    disabled={isLoadingItems || !settings.contentTypeId}
                  >
                    <SelectTrigger
                      id="itemSlug"
                      className={cn(
                        "h-7 w-[140px] px-2 text-[11px] rounded-md",
                        isLoadingItems && "animate-pulse",
                      )}
                    >
                      {isLoadingItems ? (
                        <div className="flex items-center gap-1.5">
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Loading...
                          </span>
                        </div>
                      ) : (
                        <SelectValue
                          placeholder={
                            settings.contentTypeId
                              ? "Select item..."
                              : "Select type first"
                          }
                        />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {contentItems.map((item) => (
                        <SelectItem key={item.id} value={item.slug}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span>{item.title || item.slug}</span>
                          </div>
                        </SelectItem>
                      ))}
                      {contentItems.length === 0 &&
                        !isLoadingItems &&
                        settings.contentTypeId && (
                          <SelectItem value="__empty__" disabled>
                            <span className="text-muted-foreground">
                              No items available
                            </span>
                          </SelectItem>
                        )}
                    </SelectContent>
                  </Select>
                </ConfigField>

                {settings.itemSlug && (
                  <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150">
                    <FileText className="h-3 w-3 text-muted-foreground/40" />
                    <span className="text-[10px] text-muted-foreground/50 font-mono">
                      {settings.itemSlug}
                    </span>
                  </div>
                )}
              </ConfigSection>
            </>
          )}

          {/* ── Display Mode (list/grid) ── */}
          {isListOrGrid && settings.contentTypeId && (
            <>
              <SectionDivider />

              <ConfigSection
                title="Display"
                icon={<LayoutGrid className="h-3 w-3" />}
              >
                <ConfigField
                  label="Mode"
                  htmlFor="displayMode"
                  hint="Choose between a vertical list layout or a grid layout."
                >
                  <Select
                    value={settings.displayMode || "list"}
                    onValueChange={(value: "list" | "grid") =>
                      updateSettings({ displayMode: value })
                    }
                  >
                    <SelectTrigger
                      id="displayMode"
                      className="h-7 w-[100px] px-2 text-[11px] rounded-md"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="list">
                        <div className="flex items-center gap-2">
                          <LayoutList className="h-3 w-3 text-muted-foreground" />
                          <span>List</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="grid">
                        <div className="flex items-center gap-2">
                          <LayoutGrid className="h-3 w-3 text-muted-foreground" />
                          <span>Grid</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </ConfigField>

                {/* Max Items */}
                <ConfigField
                  label="Max items"
                  htmlFor="limit"
                  hint="Maximum number of items to display."
                >
                  <div className="flex items-center gap-1">
                    <Input
                      id="limit"
                      type="number"
                      min={1}
                      max={100}
                      value={settings.limit || 10}
                      onChange={(e) =>
                        updateSettings({
                          limit: parseInt(e.target.value) || 10,
                        })
                      }
                      className="h-7 w-[56px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                    />
                    <span className="text-[10px] text-muted-foreground/60 font-medium select-none">
                      items
                    </span>
                  </div>
                </ConfigField>

                {/* Display summary */}
                <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
                  {settings.displayMode === "grid" ? (
                    <Columns3 className="h-3 w-3 text-muted-foreground/40" />
                  ) : (
                    <LayoutList className="h-3 w-3 text-muted-foreground/40" />
                  )}
                  <span className="text-[10px] text-muted-foreground/50">
                    Showing up to{" "}
                    <span className="font-mono tabular-nums font-medium text-muted-foreground/70">
                      {settings.limit || 10}
                    </span>{" "}
                    items in{" "}
                    <span className="font-medium text-muted-foreground/70">
                      {settings.displayMode || "list"}
                    </span>{" "}
                    view
                  </span>
                </div>
              </ConfigSection>
            </>
          )}

          {/* ── Sorting (list/grid) ── */}
          {isListOrGrid && settings.contentTypeId && (
            <>
              <SectionDivider />

              <ConfigSection
                title="Sorting"
                icon={<ArrowUpDown className="h-3 w-3" />}
              >
                <ConfigField
                  label="Sort by"
                  htmlFor="sortBy"
                  hint="Which field to sort content items by."
                >
                  <Select
                    value={settings.sortBy || "createdAt"}
                    onValueChange={(value) =>
                      updateSettings({
                        sortBy: value as "title" | "createdAt" | "updatedAt",
                      })
                    }
                  >
                    <SelectTrigger
                      id="sortBy"
                      className="h-7 w-[120px] px-2 text-[11px] rounded-md"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">
                        <div className="flex items-center gap-2">
                          <Type className="h-3 w-3 text-muted-foreground" />
                          <span>Title</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="createdAt">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>Created Date</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="updatedAt">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>Updated Date</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </ConfigField>

                <ConfigField
                  label="Order"
                  htmlFor="sortOrder"
                  hint="Sort direction — ascending (A→Z, oldest first) or descending (Z→A, newest first)."
                >
                  <Select
                    value={settings.sortOrder || "desc"}
                    onValueChange={(value: "asc" | "desc") =>
                      updateSettings({ sortOrder: value })
                    }
                  >
                    <SelectTrigger
                      id="sortOrder"
                      className="h-7 w-[110px] px-2 text-[11px] rounded-md"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">
                        <div className="flex items-center gap-2">
                          <SortAsc className="h-3 w-3 text-muted-foreground" />
                          <span>Ascending</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="desc">
                        <div className="flex items-center gap-2">
                          <SortDesc className="h-3 w-3 text-muted-foreground" />
                          <span>Descending</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </ConfigField>

                {/* Sort summary */}
                <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
                  {settings.sortOrder === "asc" ? (
                    <SortAsc className="h-3 w-3 text-muted-foreground/40" />
                  ) : (
                    <SortDesc className="h-3 w-3 text-muted-foreground/40" />
                  )}
                  <span className="text-[10px] text-muted-foreground/50">
                    Sorted by{" "}
                    <span className="font-medium text-muted-foreground/70">
                      {settings.sortBy || "createdAt"}
                    </span>
                    ,{" "}
                    <span className="font-medium text-muted-foreground/70">
                      {settings.sortOrder === "asc"
                        ? "ascending"
                        : "descending"}
                    </span>
                  </span>
                </div>
              </ConfigSection>
            </>
          )}

          {/* ── Fields to Display (grid only) ── */}
          {isGrid && settings.contentTypeId && (
            <>
              <SectionDivider />

              <ConfigSection
                title="Visible Fields"
                icon={<Eye className="h-3 w-3" />}
              >
                <div className="flex flex-col gap-1">
                  {DISPLAY_FIELDS.map((field) => {
                    const isActive =
                      settings.fieldsToShow?.includes(field) ??
                      ["title", "content"].includes(field);

                    return (
                      <div
                        key={field}
                        className={cn(
                          "flex items-center justify-between gap-2",
                          "rounded-md px-2 py-1.5",
                          "transition-colors duration-150",
                          isActive
                            ? "bg-muted/30"
                            : "bg-transparent hover:bg-muted/10",
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={cn(
                              "flex items-center justify-center",
                              "h-5 w-5 rounded-md shrink-0",
                              isActive
                                ? "bg-foreground/5 text-foreground/60"
                                : "bg-muted/30 text-muted-foreground/40",
                              "transition-colors duration-150",
                            )}
                          >
                            {FIELD_ICONS[field] ?? <Hash className="h-3 w-3" />}
                          </span>
                          <span
                            className={cn(
                              "text-[11px] font-medium capitalize truncate",
                              isActive
                                ? "text-foreground/80"
                                : "text-muted-foreground/60",
                              "transition-colors duration-150",
                            )}
                          >
                            {field}
                          </span>
                        </div>

                        <Switch
                          id={`field-${field}`}
                          checked={isActive}
                          onCheckedChange={(checked) => {
                            const currentFields = settings.fieldsToShow || [
                              "title",
                              "content",
                            ];
                            const newFields = checked
                              ? [...currentFields, field]
                              : currentFields.filter((f) => f !== field);
                            updateSettings({ fieldsToShow: newFields });
                          }}
                          className="scale-[0.65] origin-right"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Fields summary */}
                <div className="flex items-center gap-1.5 pl-0.5 pt-1 animate-in fade-in-0 duration-150">
                  <CheckSquare className="h-3 w-3 text-muted-foreground/40" />
                  <span className="text-[10px] text-muted-foreground/50">
                    <span className="font-mono tabular-nums font-medium text-muted-foreground/70">
                      {activeFieldCount}
                    </span>{" "}
                    {activeFieldCount === 1 ? "field" : "fields"} visible in
                    grid
                  </span>
                </div>
              </ConfigSection>
            </>
          )}

          {/* ── Filters (placeholder) ── */}
          {isListOrGrid && settings.contentTypeId && (
            <>
              <SectionDivider />

              <ConfigSection
                title="Filters"
                icon={<Filter className="h-3 w-3" />}
              >
                <ConfigEmpty
                  icon={<Filter className="h-5 w-5" />}
                  message="Advanced filtering options coming soon"
                />
              </ConfigSection>
            </>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default CMSConfiguration;
