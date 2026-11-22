import type { Dispatch, SetStateAction } from "react";
import { Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import type { ContentField } from "@/features/cms/interfaces/cms.interface";
import type { EditableItemValues } from "../types";

interface NewItemRowProps {
  newRow: EditableItemValues;
  contentFields: ContentField[];
  setNewRow: Dispatch<SetStateAction<EditableItemValues | null>>;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function NewItemRow({ newRow, contentFields, setNewRow, isSaving, onSave, onCancel }: NewItemRowProps) {
  return (
    <TableRow className="bg-primary/5 hover:bg-primary/5">
      <TableCell className="px-3 py-1.5">
        <Input
          autoFocus
          value={newRow.title}
          onChange={(e) =>
            setNewRow((p) => p && { ...p, title: e.target.value })
          }
          placeholder="Title"
          className="h-7 text-xs min-w-32"
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave();
            if (e.key === "Escape") onCancel();
          }}
        />
      </TableCell>
      <TableCell className="px-3 py-1.5">
        <Input
          value={newRow.slug}
          onChange={(e) =>
            setNewRow((p) => p && { ...p, slug: e.target.value })
          }
          placeholder="slug"
          className="h-7 text-xs font-mono min-w-32"
        />
      </TableCell>
      <TableCell className="px-3 py-1.5">
        <Switch
          checked={newRow.published}
          onCheckedChange={(v) =>
            setNewRow((p) => p && { ...p, published: v })
          }
        />
      </TableCell>
      {contentFields.map((field) => (
        <TableCell key={field.id} className="px-3 py-1.5">
          <Input
            value={newRow.fieldValues[field.id] ?? ""}
            onChange={(e) =>
              setNewRow(
                (p) =>
                  p && {
                    ...p,
                    fieldValues: {
                      ...p.fieldValues,
                      [field.id]: e.target.value,
                    },
                  },
              )
            }
            placeholder={field.name}
            className="h-7 text-xs min-w-32"
          />
        </TableCell>
      ))}
      {/* empty cell under + add-field column */}
      <TableCell className="px-3 py-1.5" />
      <TableCell className="px-3 py-1.5">
        <div className="flex items-center gap-0.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={onSave}
            disabled={!newRow.title.trim() || isSaving}
            title="Save"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={onCancel}
            title="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
