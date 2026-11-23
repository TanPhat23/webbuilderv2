import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Database, FileText, Loader2 } from "lucide-react";
import { ConfigEmpty, ConfigField, ConfigSection } from "./_shared";

interface RemoteOption {
  value: string;
  label: string;
}

function CMSRemoteSelectField({
  id,
  label,
  hint,
  value,
  placeholder,
  emptyLabel,
  isLoading,
  disabled,
  icon,
  options,
  onValueChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  placeholder: string;
  emptyLabel: string;
  isLoading: boolean;
  disabled?: boolean;
  icon: ReactNode;
  options: readonly RemoteOption[];
  onValueChange: (value: string) => void;
}) {
  return (
    <ConfigField label={label} htmlFor={id} hint={hint}>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger
          id={id}
          className={cn(
            "h-7 w-[140px] px-2 text-[11px] rounded-md",
            isLoading && "animate-pulse",
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <div className="flex items-center gap-2">
                {icon}
                <span>{opt.label}</span>
              </div>
            </SelectItem>
          ))}
          {options.length === 0 && !isLoading && (
            <SelectItem value="__empty__" disabled>
              <span className="text-muted-foreground">{emptyLabel}</span>
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </ConfigField>
  );
}

export function CMSDataSourceSection({
  contentTypeId,
  selectedTypeName,
  contentTypes,
  isLoadingTypes,
  onSelectType,
}: {
  contentTypeId: string;
  selectedTypeName?: string;
  contentTypes: ReadonlyArray<{ id: string; name?: string }>;
  isLoadingTypes: boolean;
  onSelectType: (id: string) => void;
}) {
  return (
    <ConfigSection title="Data Source" icon={<Database className="h-3 w-3" />}>
      <CMSRemoteSelectField
        id="contentTypeId"
        label="Content Type"
        hint="Choose the content type to display from your CMS."
        value={contentTypeId}
        placeholder="Select type..."
        emptyLabel="No content types available"
        isLoading={isLoadingTypes}
        icon={<Database className="h-3 w-3 text-muted-foreground" />}
        options={contentTypes.map((ct) => ({
          value: ct.id,
          label: ct.name || ct.id,
        }))}
        onValueChange={onSelectType}
      />

      {!contentTypeId && !isLoadingTypes && (
        <ConfigEmpty
          icon={<Database className="h-5 w-5" />}
          message="Select a content type to configure this component"
        />
      )}

      {selectedTypeName && (
        <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-medium">
            <Database className="h-2.5 w-2.5" />
            {selectedTypeName}
          </span>
        </div>
      )}
    </ConfigSection>
  );
}

export function CMSItemSection({
  contentTypeId,
  itemSlug,
  contentItems,
  isLoadingItems,
  onSelectSlug,
}: {
  contentTypeId?: string;
  itemSlug: string;
  contentItems: ReadonlyArray<{ id: string; slug: string; title?: string }>;
  isLoadingItems: boolean;
  onSelectSlug: (slug: string) => void;
}) {
  return (
    <ConfigSection title="Item Selection" icon={<FileText className="h-3 w-3" />}>
      <CMSRemoteSelectField
        id="itemSlug"
        label="Item"
        hint="Choose the specific content item to display."
        value={itemSlug}
        placeholder={contentTypeId ? "Select item..." : "Select type first"}
        emptyLabel="No items available"
        isLoading={isLoadingItems}
        disabled={!contentTypeId}
        icon={<FileText className="h-3 w-3 text-muted-foreground" />}
        options={contentItems.map((item) => ({
          value: item.slug,
          label: item.title || item.slug,
        }))}
        onValueChange={onSelectSlug}
      />

      {itemSlug && (
        <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150">
          <FileText className="h-3 w-3 text-muted-foreground/40" />
          <span className="text-[10px] text-muted-foreground/50 font-mono">
            {itemSlug}
          </span>
        </div>
      )}
    </ConfigSection>
  );
}
