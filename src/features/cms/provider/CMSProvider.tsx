"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useCMSManager } from "@/features/cms";
import { CMSContextValue } from "../components/types";

const CMSContext = createContext<CMSContextValue | null>(null);

export function useCMSContext(): CMSContextValue {
  const ctx = useContext(CMSContext);
  if (!ctx) throw new Error("useCMSContext must be used inside <CMSProvider>");
  return ctx;
}

export function CMSProvider({ children }: { children: React.ReactNode }) {
  const manager = useCMSManager();

  const value = useMemo<CMSContextValue>(
    () => ({
      selectedTypeId: manager.selectedTypeId,
      selectedType: manager.contentTypes.find(
        (t) => t.id === manager.selectedTypeId,
      ),

      contentTypes: manager.contentTypes,
      contentFields: manager.contentFields,
      contentItems: manager.contentItems,

      typesLoading: manager.typesLoading,
      fieldsLoading: manager.fieldsLoading,
      itemsLoading: manager.itemsLoading,

      createTypeMutation: manager.createTypeMutation,
      updateTypeMutation: manager.updateTypeMutation,
      deleteTypeMutation: manager.deleteTypeMutation,

      createFieldMutation: manager.createFieldMutation,
      updateFieldMutation: manager.updateFieldMutation,
      deleteFieldMutation: manager.deleteFieldMutation,

      createItemMutation: manager.createItemMutation,
      updateItemMutation: manager.updateItemMutation,
      deleteItemMutation: manager.deleteItemMutation,

      selectType: manager.selectType,
      handleCreateType: manager.handleCreateType,
      handleCreateField: manager.handleCreateField,
      handleCreateItem: manager.handleCreateItem,

      handleDeleteType: (id: string) =>
        manager.deleteTypeMutation.mutate(id),

      handleDeleteField: (contentTypeId: string, fieldId: string) =>
        manager.deleteFieldMutation.mutate({ contentTypeId, fieldId }),

      handleDeleteItem: (contentTypeId: string, itemId: string) =>
        manager.deleteItemMutation.mutate({ contentTypeId, itemId }),
    }),
    [manager],
  );

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
}
