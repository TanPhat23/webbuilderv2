import { useState, useCallback } from "react";

export interface GridEditorOptions<T> {
  onSave?: (id: string, data: Partial<T>) => Promise<void> | void;
  onCreate?: (data: Partial<T>) => Promise<void> | void;
  initialData?: T[];
}

export interface GridEditorState<T> {
  editingRows: Set<string>;
  editedValues: Record<string, Partial<T>>;
  newRow: Partial<T> | null;
}

export interface GridEditorActions<T> {
  startEditing: (id: string, currentData?: T) => void;
  stopEditing: (id: string) => void;
  updateValue: (id: string, field: keyof T, value: T[keyof T]) => void;
  saveChanges: (id: string) => Promise<void>;
  addNewRow: (initialData?: Partial<T>) => void;
  cancelNewRow: () => void;
  saveNewRow: () => Promise<void>;
  isEditing: (id: string) => boolean;
  getEditedValue: (
    id: string,
    field: keyof T,
    defaultValue?: T[keyof T],
  ) => T[keyof T] | undefined;
}

export function useGridEditor<T extends { id: string }>({
  onSave,
  onCreate,
}: GridEditorOptions<T> = {}): GridEditorState<T> & GridEditorActions<T> {
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [editedValues, setEditedValues] = useState<Record<string, Partial<T>>>(
    {},
  );
  const [newRow, setNewRow] = useState<Partial<T> | null>(null);

  const startEditing = useCallback((id: string, currentData?: T) => {
    if (currentData) {
      setEditedValues((prev) => ({
        ...prev,
        [id]: { ...currentData },
      }));
    }
    setEditingRows((prev) => new Set([...prev, id]));
  }, []);

  const stopEditing = useCallback((id: string) => {
    setEditingRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setEditedValues((prev) => {
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });
  }, []);

  const updateValue = useCallback(
    (id: string, field: keyof T, value: T[keyof T]) => {
      if (newRow && "isNew" in newRow && newRow.isNew) {
        setNewRow((prev) => ({ ...prev!, [field]: value }));
      } else {
        setEditedValues((prev) => ({
          ...prev,
          [id]: { ...prev[id], [field]: value },
        }));
      }
    },
    [newRow],
  );

  const saveChanges = useCallback(
    async (id: string) => {
      if (!onSave) return;

      const editedData = editedValues[id];
      if (!editedData) return;

      try {
        await onSave(id, editedData);
        stopEditing(id);
      } catch (error) {
        console.error("Failed to save changes:", error);
        throw error;
      }
    },
    [editedValues, onSave, stopEditing],
  );

  const addNewRow = useCallback((initialData: Partial<T> = {}) => {
    setNewRow({ ...initialData, isNew: true, isEditing: true } as Partial<T>);
  }, []);

  const cancelNewRow = useCallback(() => {
    setNewRow(null);
  }, []);

  const saveNewRow = useCallback(async () => {
    if (!onCreate || !newRow) return;

    try {
      await onCreate(newRow);
      setNewRow(null);
    } catch (error) {
      console.error("Failed to create new item:", error);
      throw error;
    }
  }, [newRow, onCreate]);

  const isEditing = useCallback(
    (id: string) => editingRows.has(id),
    [editingRows],
  );

  const getEditedValue = useCallback(
    (
      id: string,
      field: keyof T,
      defaultValue?: T[keyof T],
    ): T[keyof T] | undefined => {
      const edited = editedValues[id];
      return edited?.[field] ?? defaultValue;
    },
    [editedValues],
  );

  return {
    // State
    editingRows,
    editedValues,
    newRow,

    // Actions
    startEditing,
    stopEditing,
    updateValue,
    saveChanges,
    addNewRow,
    cancelNewRow,
    saveNewRow,
    isEditing,
    getEditedValue,
  };
}
