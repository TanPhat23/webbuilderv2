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

export type CmsAuthToken = string;

export interface TokenAwareCmsService {
  getContentTypes(token: CmsAuthToken): Promise<ContentType[]>;
  createContentType(
    data: Partial<ContentType>,
    token: CmsAuthToken,
  ): Promise<ContentType>;
  getContentTypeById(id: string, token: CmsAuthToken): Promise<ContentType>;
  updateContentType(
    id: string,
    data: Partial<ContentType>,
    token: CmsAuthToken,
  ): Promise<ContentType>;
  deleteContentType(id: string, token: CmsAuthToken): Promise<boolean>;
  getContentFieldsByContentType(
    contentTypeId: string,
    token: CmsAuthToken,
  ): Promise<ContentField[]>;
  createContentField(
    contentTypeId: string,
    data: Partial<ContentField>,
    token: CmsAuthToken,
  ): Promise<ContentField>;
  getContentFieldById(
    contentTypeId: string,
    fieldId: string,
    token: CmsAuthToken,
  ): Promise<ContentField>;
  updateContentField(
    contentTypeId: string,
    fieldId: string,
    data: Partial<ContentField>,
    token: CmsAuthToken,
  ): Promise<ContentField>;
  deleteContentField(
    contentTypeId: string,
    fieldId: string,
    token: CmsAuthToken,
  ): Promise<boolean>;
  getContentItemsByContentType(
    contentTypeId: string,
    token: CmsAuthToken,
  ): Promise<ContentItem[]>;
  createContentItem(
    contentTypeId: string,
    data: ContentItemWriteInput,
    token: CmsAuthToken,
  ): Promise<ContentItem>;
  getContentItemById(
    contentTypeId: string,
    itemId: string,
    token: CmsAuthToken,
  ): Promise<ContentItem>;
  updateContentItem(
    contentTypeId: string,
    itemId: string,
    data: ContentItemWriteInput,
    token: CmsAuthToken,
  ): Promise<ContentItem>;
  deleteContentItem(
    contentTypeId: string,
    itemId: string,
    token: CmsAuthToken,
  ): Promise<boolean>;
  getPublicContent(
    params: PublicContentQuery | undefined,
    token: CmsAuthToken,
  ): Promise<ContentItem[]>;
  getPublicContentItem(
    contentTypeId: string,
    slug: string,
    token: CmsAuthToken,
  ): Promise<ContentItem>;
}
