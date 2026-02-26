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
