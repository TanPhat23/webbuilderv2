"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, Loader2 } from "lucide-react";
import { EditingField, FIELD_TYPES } from "../types";

interface FieldFormProps {
  values: EditingField;
  onChange: (v: EditingField) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  saveLabel: string;
}

export function FieldForm({
  values,
  onChange,
  onSave,
  onCancel,
  isSaving,
  saveLabel,
}: FieldFormProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Name</label>
        <Input
          autoFocus
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          className="h-7 text-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave();
            if (e.key === "Escape") onCancel();
          }}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Type</label>
        <Select
          value={values.type}
          onValueChange={(v) => onChange({ ...values, type: v })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FIELD_TYPES.map((t) => (
              <SelectItem key={t} value={t} className="text-xs">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">Required</label>
        <Switch
          checked={values.required}
          onCheckedChange={(v) => onChange({ ...values, required: v })}
        />
      </div>

      <div className="flex items-center gap-2 pt-1 border-t">
        <Button
          size="sm"
          className="h-7 text-xs flex-1 gap-1"
          onClick={onSave}
          disabled={!values.name.trim() || isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Save className="h-3 w-3" />
          )}
          {saveLabel}
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
    </div>
  );
}
