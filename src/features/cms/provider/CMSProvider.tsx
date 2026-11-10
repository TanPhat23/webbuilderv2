import React, { createContext, useContext } from "react";
import { useCMSManager } from "../hooks/useCMSManager";
import type { CMSContextValue } from "../components/types";

const CMSContext = createContext<CMSContextValue | null>(null);

export function useCMSContext(): CMSContextValue {
  const ctx = useContext(CMSContext);
  if (!ctx) throw new Error("useCMSContext must be used inside <CMSProvider>");
  return ctx;
}

export function CMSProvider({ children }: { children: React.ReactNode }) {
  const manager = useCMSManager();

  const value: CMSContextValue = {
    ...manager,
    handleDeleteType: (id) => manager.deleteTypeMutation.mutate({ id }),
    handleDeleteField: (contentTypeId, fieldId) =>
      manager.deleteFieldMutation.mutate({ contentTypeId, fieldId }),
    handleDeleteItem: (contentTypeId, itemId) =>
      manager.deleteItemMutation.mutate({ contentTypeId, itemId }),
  };

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
}
