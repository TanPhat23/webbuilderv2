import { useEffect, useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  useSelectedElement,
  useUpdateElement,
  type TableSettings,
} from "@/features/editor";
import { newEntityId } from "@webbuilder/site-runtime/lib/entity-id";
import {
  Columns3,
  FileText,
  Paintbrush,
  Plus,
  Settings2,
  Table,
  Type,
} from "lucide-react";
import {
  TABLE_APPEARANCE_OPTIONS,
  createTableColumn,
  getActiveTableAppearanceFlags,
  moveTableColumn,
  removeTableColumnAt,
  updateTableColumnAt,
} from "../../../lib/tableConfig";
import {
  AccordionSection,
  ConfigEmpty,
  ConfigPanel,
  SectionDivider,
  settingUpdater,
} from "./_shared";
import { ConfigSwitch, ConfigTextInput } from "./_shared/ConfigInputs";
import { TableColumnEditor } from "./TableColumnEditor";

export default function TableConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  const [expandedColumnId, setExpandedColumnId] = useState<string | null>(null);

  const elementId = selectedElement?.id;
  useEffect(() => {
    setExpandedColumnId(null);
  }, [elementId]);

  if (!selectedElement || selectedElement.type !== "Table") {
    return null;
  }

  const settings: TableSettings = selectedElement.settings ?? {};
  const columns = settings.columns ?? [];
  const updateSetting = settingUpdater(
    updateElement,
    selectedElement.id,
    settings,
  );

  const addColumn = () => {
    const newColumn = createTableColumn(columns.length, newEntityId());
    updateSetting("columns", [...columns, newColumn]);
    setExpandedColumnId(newColumn.id);
  };

  const removeColumn = (index: number) => {
    const next = removeTableColumnAt(columns, index);
    updateSetting("columns", next);
    if (columns[index]?.id === expandedColumnId) {
      setExpandedColumnId(null);
    }
  };

  const hasCaption = Boolean(settings.caption && settings.caption.length > 0);
  const appearanceFlags = getActiveTableAppearanceFlags(settings);

  return (
    <ConfigPanel
      value="table-settings"
      icon={<Table className="h-3.5 w-3.5" />}
      title="Table Settings"
      trailing={
        columns.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground tabular-nums">
            {columns.length} col{columns.length !== 1 ? "s" : ""}
          </span>
        )
      }
    >
      <Accordion
        type="multiple"
        defaultValue={["general", "columns", "appearance"]}
        className="w-full"
      >
        <AccordionSection
          value="general"
          title="General"
          icon={<Settings2 />}
          nested
        >
          <ConfigTextInput
            id="table-caption"
            name="caption"
            label="Caption"
            hint="An accessible caption for the table. Rendered as a <caption> element above the table. Important for screen readers to understand the table's purpose."
            value={settings.caption ?? ""}
            placeholder="Table description..."
            onValueChange={(value) =>
              updateSetting("caption", value || undefined)
            }
            className="h-7 w-full px-2 text-[11px] rounded-md"
            vertical
          />

          {hasCaption ? (
            <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
              <FileText className="h-3 w-3 text-emerald-500/60" />
              <span className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60">
                Caption set — accessible to screen readers
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
              <FileText className="h-3 w-3 text-amber-500/60" />
              <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60 leading-tight">
                Add a caption for better accessibility
              </span>
            </div>
          )}
        </AccordionSection>

        <AccordionSection
          value="columns"
          title="Columns"
          icon={<Columns3 />}
          badge={
            columns.length > 0 ? (
              <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground tabular-nums">
                {columns.length}
              </span>
            ) : undefined
          }
          nested
        >
          {columns.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {columns.map((col, index) => (
                <TableColumnEditor
                  key={col.id}
                  column={col}
                  index={index}
                  isExpanded={expandedColumnId === col.id}
                  onToggleExpand={() =>
                    setExpandedColumnId(
                      expandedColumnId === col.id ? null : col.id,
                    )
                  }
                  onChange={(updated) =>
                    updateSetting(
                      "columns",
                      updateTableColumnAt(columns, index, updated),
                    )
                  }
                  onRemove={() => removeColumn(index)}
                  onMoveUp={() => {
                    const reordered = moveTableColumn(columns, index, "up");
                    if (reordered) updateSetting("columns", reordered);
                  }}
                  onMoveDown={() => {
                    const reordered = moveTableColumn(columns, index, "down");
                    if (reordered) updateSetting("columns", reordered);
                  }}
                  isFirst={index === 0}
                  isLast={index === columns.length - 1}
                />
              ))}
            </div>
          ) : (
            <ConfigEmpty
              icon={<Columns3 className="h-5 w-5" />}
              message="No columns defined. Add columns to configure the table structure."
            />
          )}

          <SectionDivider />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addColumn}
            className="w-full h-7 text-[11px] gap-1.5"
          >
            <Plus className="h-3 w-3" />
            Add Column
          </Button>
        </AccordionSection>

        <AccordionSection
          value="appearance"
          title="Appearance"
          icon={<Paintbrush />}
          nested
        >
          {TABLE_APPEARANCE_OPTIONS.map((opt) => (
            <ConfigSwitch
              key={opt.key}
              id={opt.id}
              label={opt.label}
              hint={opt.hint}
              checked={Boolean(settings[opt.key])}
              onCheckedChange={(checked) => updateSetting(opt.key, checked)}
            />
          ))}

          <SectionDivider />
          <div className="flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150">
            {appearanceFlags.length > 0 ? (
              appearanceFlags.map((flag) => (
                <span
                  key={flag}
                  className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                >
                  {flag}
                </span>
              ))
            ) : (
              <div className="flex items-center gap-1.5">
                <Paintbrush className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/50">
                  Default appearance — no special styles
                </span>
              </div>
            )}
          </div>
        </AccordionSection>
      </Accordion>

      <SectionDivider className="mt-2" />
      <div className="flex items-center gap-1.5 flex-wrap pt-2 pl-0.5 animate-in fade-in-0 duration-150">
        <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          <Table className="h-2.5 w-2.5" />
          &lt;table&gt;
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground tabular-nums">
          <Columns3 className="h-2.5 w-2.5" />
          {columns.length} col{columns.length !== 1 ? "s" : ""}
        </span>
        {hasCaption && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            <Type className="h-2.5 w-2.5" />
            captioned
          </span>
        )}
      </div>
    </ConfigPanel>
  );
}
