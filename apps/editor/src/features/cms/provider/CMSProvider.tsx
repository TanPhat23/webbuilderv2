import React, { createContext, useContext } from "react";
import { useCMSWorkspace } from "../hooks/useCMSManager";
import type { CMSContextValue } from "../components/types";

const CMSContext = createContext<CMSContextValue | null>(null);

export function useCMSContext(): CMSContextValue {
  const ctx = useContext(CMSContext);
  if (!ctx) throw new Error("useCMSContext must be used inside <CMSProvider>");
  return ctx;
}

export function CMSProvider({
  children,
  projectId,
}: {
  children: React.ReactNode;
  projectId?: string;
}): React.ReactElement {
  const workspace = useCMSWorkspace(projectId);

  const value: CMSContextValue = {
    ...workspace,
    handleDeleteType: (id) => workspace.deleteTypeMutation.mutate({ id }),
    handleDeleteField: (contentTypeId, fieldId) =>
      workspace.deleteFieldMutation.mutate({ contentTypeId, fieldId }),
    handleDeleteItem: (contentTypeId, itemId) =>
      workspace.deleteItemMutation.mutate({ contentTypeId, itemId }),
  };

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
}
