"use client";
import { useState, useCallback, useMemo } from "react";

interface UseTableEditingOptions<T> {
  /**
   * Function to extract the initial values from an item when editing starts
   */
  getInitialValues: (item: T) => Record<string, any>;
}

interface UseTableEditingReturn<T> {
  /**
   * Set of IDs currently being edited
   */
  editingRowsSet: Set<string>;

  /**
   * Array of IDs currently being edited
   */
  editingRows: string[];

  /**
   * Map of edited values by item ID
   */
  editedValues: Record<string, Record<string, any>>;

  /**
   * New row being created (if any)
   */
  newRow: Record<string, any> | null;

  /**
   * Start editing an existing item
   */
  startEditing: (itemId: string, item: T) => void;

  /**
   * Stop editing an existing item
   */
  stopEditing: (itemId: string) => void;

  /**
   * Update a field value for an item being edited
   */
  updateField: (itemId: string, field: string, value: any) => void;

  /**
   * Get the current value for a field (edited or original)
   */
  getFieldValue: (itemId: string, field: string, originalValue: any) => any;

  /**
   * Start creating a new row
   */
  startNewRow: (initialValues?: Record<string, any>) => void;

  /**
   * Cancel creating a new row
   */
  cancelNewRow: () => void;

  /**
   * Update a field in the new row
   */
  updateNewRowField: (field: string, value: any) => void;

  /**
   * Clear all editing state
   */
  clearEditingState: (itemId?: string) => void;

  /**
   * Check if an item is being edited
   */
  isEditing: (itemId: string) => boolean;
}

/**
 * Reusable hook for managing table editing state
 * Handles both editing existing rows and creating new rows
 */
export function useTableEditing<T extends { id: string }>(
  options?: UseTableEditingOptions<T>,
): UseTableEditingReturn<T> {
  const [editingRows, setEditingRows] = useState<string[]>([]);
  const [editedValues, setEditedValues] = useState<
    Record<string, Record<string, any>>
  >({});
  const [newRow, setNewRow] = useState<Record<string, any> | null>(null);

  const editingRowsSet = useMemo(() => new Set(editingRows), [editingRows]);

  const startEditing = useCallback(
    (itemId: string, item: T) => {
      if (options?.getInitialValues) {
        setEditedValues((prev) => ({
          ...prev,
          [itemId]: options.getInitialValues(item),
        }));
      }
      setEditingRows((prev) => [...prev, itemId]);
    },
    [options],
  );

  const stopEditing = useCallback((itemId: string) => {
    setEditingRows((prev) => prev.filter((id) => id !== itemId));
    setEditedValues((prev) => {
      const newValues = { ...prev };
      delete newValues[itemId];
      return newValues;
    });
  }, []);

  const updateField = useCallback(
    (itemId: string, field: string, value: any) => {
      setEditedValues((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [field]: value,
        },
      }));
    },
    [],
  );

  const getFieldValue = useCallback(
    (itemId: string, field: string, originalValue: any) => {
      return editedValues[itemId]?.[field] ?? originalValue;
    },
    [editedValues],
  );

  const startNewRow = useCallback((initialValues: Record<string, any> = {}) => {
    setNewRow({
      isNew: true,
      isEditing: true,
      ...initialValues,
    });
  }, []);

  const cancelNewRow = useCallback(() => {
    setNewRow(null);
  }, []);

  const updateNewRowField = useCallback((field: string, value: any) => {
    setNewRow((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  }, []);

  const clearEditingState = useCallback(
    (itemId?: string) => {
      if (itemId) {
        stopEditing(itemId);
      } else {
        setEditingRows([]);
        setEditedValues({});
        setNewRow(null);
      }
    },
    [stopEditing],
  );

  const isEditing = useCallback(
    (itemId: string) => editingRowsSet.has(itemId),
    [editingRowsSet],
  );

  return {
    editingRowsSet,
    editingRows,
    editedValues,
    newRow,
    startEditing,
    stopEditing,
    updateField,
    getFieldValue,
    startNewRow,
    cancelNewRow,
    updateNewRowField,
    clearEditingState,
    isEditing,
  };
}
