import type { CMSManagerResult } from "../hooks/useCMSManager";

export interface EditingField {
  name: string;
  type: string;
  required: boolean;
}

export interface EditableItemValues {
  title: string;
  slug: string;
  published: boolean;
  fieldValues: Record<string, string>;
}

export const FIELD_TYPES = [
  "text",
  "textarea",
  "richtext",
  "number",
  "boolean",
  "date",
  "email",
  "url",
  "select",
  "multiselect",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export type CMSContextValue = CMSManagerResult & {
  handleDeleteType: (id: string) => void;
  handleDeleteField: (contentTypeId: string, fieldId: string) => void;
  handleDeleteItem: (contentTypeId: string, itemId: string) => void;
};
