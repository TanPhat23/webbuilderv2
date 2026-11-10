export interface ContentType {
  id: string;
  name: string;
  description?: string;
  fields?: ContentField[];
  items?: ContentItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentField {
  id: string;
  contentTypeId: string;
  name: string;
  type: string;
  required: boolean;
  contentType?: ContentType;
  values?: ContentFieldValue[];
}

export interface ContentFieldValue {
  id: string;
  contentItemId: string;
  fieldId: string;
  value?: string;
  contentItem?: ContentItem;
  field?: ContentField;
}

export interface ContentFieldValueInput {
  fieldId: string;
  value: string;
}

export interface ContentItem {
  id: string;
  contentTypeId: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  contentType?: ContentType;
  fieldValues?: ContentFieldValue[];
}

export interface ContentItemWriteInput extends Omit<
  Partial<ContentItem>,
  "fieldValues"
> {
  fieldValues?: ContentFieldValueInput[];
}

export interface PublicContentQuery {
  contentTypeId?: string;
  limit?: number;
  sortBy?: "title" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}
