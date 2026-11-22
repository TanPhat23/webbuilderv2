import { useCallback, useMemo, useRef, useState } from "react";
import type { ContentItem } from "@/features/cms/interfaces/cms.interface";
import { ContentItemFormSchema } from "@/features/cms/schema/cms";
import type { CMSContextValue, EditableItemValues } from "../types";

type EditingOptions = Pick<CMSContextValue,
  "contentItems" | "contentFields" | "selectedTypeId" | "handleCreateItem" | "updateItemMutation"
>;

function serializeFieldValues(values: EditableItemValues["fieldValues"]) {
  return Object.entries(values).map(([fieldId, value]) => ({ fieldId, value }));
}

export function useCMSItemEditing({
  contentItems,
  contentFields,
  selectedTypeId,
  handleCreateItem,
  updateItemMutation,
}: EditingOptions) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, setEditValues] = useState<EditableItemValues>({
    title: "",
    slug: "",
    published: false,
    fieldValues: {},
  });

  // Refs let cell callbacks read the latest edit state without capturing it.
  const editingIdRef = useRef<string | null>(null);
  const editValuesRef = useRef<EditableItemValues>({
    title: "",
    slug: "",
    published: false,
    fieldValues: {},
  });

  const setEditValuesStable = useCallback(
    (updater: (prev: EditableItemValues) => EditableItemValues) => {
      const next = updater(editValuesRef.current);
      editValuesRef.current = next;
      setEditValues(next);
    },
    [],
  );

  const [newRow, setNewRow] = useState<EditableItemValues | null>(null);

  const fieldValuesMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    contentItems.forEach((item) => {
      map[item.id] = {};
      item.fieldValues?.forEach((fv) => {
        map[item.id][fv.fieldId] = fv.value ?? "";
      });
    });
    return map;
  }, [contentItems]);

  const startEdit = useCallback(
    (item: ContentItem) => {
      const vals: EditableItemValues = {
        title: item.title,
        slug: item.slug,
        published: item.published,
        fieldValues: { ...fieldValuesMap[item.id] },
      };
      editValuesRef.current = vals;
      editingIdRef.current = item.id;
      setEditValues(vals);
      setEditingId(item.id);
    },
    [fieldValuesMap],
  );

  const cancelEdit = useCallback(() => {
    editingIdRef.current = null;
    setEditingId(null);
  }, []);

  const saveEdit = useCallback(
    (itemId: string) => {
      const v = editValuesRef.current;
      updateItemMutation.mutate({
        contentTypeId: selectedTypeId,
        itemId,
        data: {
          title: v.title,
          slug: v.slug,
          published: v.published,
          fieldValues: serializeFieldValues(v.fieldValues),
        },
      });
      editingIdRef.current = null;
      setEditingId(null);
    },
    [updateItemMutation, selectedTypeId],
  );

  const saveNew = () => {
    if (!newRow) return;
    const result = ContentItemFormSchema.safeParse({
      title: newRow.title,
      slug: newRow.slug,
      published: newRow.published,
    });
    if (!result.success) return;
    handleCreateItem({
      ...result.data,
      fieldValues: serializeFieldValues(newRow.fieldValues),
    });
    setNewRow(null);
  };

  const cancelNewRow = () => setNewRow(null);

  const openNewRow = () => {
    const fv: Record<string, string> = {};
    contentFields.forEach((f) => {
      fv[f.id] = "";
    });
    setNewRow({ title: "", slug: "", published: false, fieldValues: fv });
  };

  return {
    editingId, editingIdRef, editValuesRef, setEditValuesStable, fieldValuesMap,
    startEdit, cancelEdit, saveEdit, newRow, setNewRow, openNewRow, cancelNewRow, saveNew,
  };
}
