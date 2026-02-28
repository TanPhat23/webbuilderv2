import { ContentType, ContentField, ContentItem } from "@/features/cms";

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

export interface CMSContextValue {
  // selected state
  selectedTypeId: string;
  selectedType: ContentType | undefined;

  // data
  contentTypes: ContentType[];
  contentFields: ContentField[];
  contentItems: ContentItem[];

  // loading
  typesLoading: boolean;
  fieldsLoading: boolean;
  itemsLoading: boolean;

  // type mutations
  createTypeMutation: any;
  updateTypeMutation: any;
  deleteTypeMutation: any;

  // field mutations
  createFieldMutation: any;
  updateFieldMutation: any;
  deleteFieldMutation: any;

  // item mutations
  createItemMutation: any;
  updateItemMutation: any;
  deleteItemMutation: any;

  // handlers
  selectType: (id: string) => void;
  handleCreateType: (data: { name: string; description?: string }) => void;
  handleCreateField: (data: EditingField) => void;
  handleCreateItem: (data: any) => void;
  handleDeleteType: (id: string) => void;
  handleDeleteField: (contentTypeId: string, fieldId: string) => void;
  handleDeleteItem: (contentTypeId: string, itemId: string) => void;
}
