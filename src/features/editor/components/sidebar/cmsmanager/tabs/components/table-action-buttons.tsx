import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Save, X, Eye } from "lucide-react";

interface TableActionButtonsProps {
  /**
   * Whether the row is in edit mode
   */
  isEditing: boolean;
  /**
   * Function to call when edit button is clicked
   */
  onEdit: () => void;
  /**
   * Function to call when save button is clicked
   */
  onSave: () => void;
  /**
   * Function to call when cancel button is clicked
   */
  onCancel: () => void;
  /**
   * Whether the save action is pending
   */
  isSaving?: boolean;
  /**
   * Optional view button handler
   */
  onView?: () => void;
  /**
   * Whether to show the view button
   */
  showViewButton?: boolean;
  /**
   * Custom class name for the container
   */
  className?: string;
}

/**
 * Reusable action buttons for table rows
 * Provides consistent edit/save/cancel UI across all tables
 */
export function TableActionButtons({
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  onView,
  showViewButton = false,
  className = "flex gap-1",
}: TableActionButtonsProps) {
  return (
    <div className={className}>
      {showViewButton && onView && (
        <Button
          size="sm"
          variant="outline"
          onClick={onView}
          className="h-8 w-8 p-0"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {isEditing ? (
        <>
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="h-8 w-8 p-0"
            title="Save"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="h-8 w-8 p-0"
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
          className="h-8 w-8 p-0"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
