"use client";

import React from "react";

interface EditableCellProps {
  itemId: string;
  editingIdRef: React.RefObject<string | null>;
  renderEdit: () => React.ReactNode;
  renderView: () => React.ReactNode;
}

export function EditableCell({
  itemId,
  editingIdRef,
  renderEdit,
  renderView,
}: EditableCellProps) {
  const isEditing = editingIdRef.current === itemId;
  return <>{isEditing ? renderEdit() : renderView()}</>;
}
