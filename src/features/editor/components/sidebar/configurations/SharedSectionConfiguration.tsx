import { Component } from "lucide-react";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useSharedSectionControls } from "@/features/editor/hooks/useSharedSectionControls";
import { ConfigField, ConfigPanel } from "./_shared";

export default function SharedSectionConfiguration() {
  const {
    isRootSection, canEdit, value, available, linkedId, isLoading, isError, setSharedSection,
  } = useSharedSectionControls();
  if (!isRootSection) {
    return <p className="text-xs text-muted-foreground">Only top-level sections can be shared.</p>;
  }

  return (
    <ConfigPanel value="shared-section" title="Shared section" icon={<Component className="size-3.5" />}>
      <ConfigField label="Use section as" htmlFor="section-sharing" vertical>
        <Select value={value} onValueChange={setSharedSection} disabled={!canEdit}>
          <SelectTrigger id="section-sharing" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="local">This page only</SelectItem>
              <SelectItem value="header">Share as header</SelectItem>
              <SelectItem value="footer">Share as footer</SelectItem>
            </SelectGroup>
            {(linkedId || available.length > 0) && (
              <SelectGroup>
                <SelectLabel>Link to a shared section</SelectLabel>
                {linkedId && !available.some(({ id }) => id === linkedId) && (
                  <SelectItem value={value} disabled>{isLoading ? "Loading source…" : "Source unavailable"}</SelectItem>
                )}
                {available.map((source) => (
                  <SelectItem key={source.id} value={source.value}>{source.label}</SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      </ConfigField>
      {isError ? (
        <p className="mt-2 text-xs text-destructive" role="status">Shared sections could not be loaded.</p>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          {linkedId
            ? "Edit the source to update this section. Choose This page only to restore the local content."
            : "Share a section so other pages can use it, or link this section to an existing source."}
        </p>
      )}
    </ConfigPanel>
  );
}
