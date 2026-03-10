import type {
  CreatePageInput as SchemaCreatePageInput,
  JsonRecord,
  JsonValue as PageStyleValue,
} from "@/features/projects/schema/page";

export interface Page {
  Id: string;
  Name: string;
  Type: string;
  Styles: JsonRecord | null;
  ProjectId: string;
  CreatedAt: Date;
  UpdatedAt: Date;
  DeletedAt: Date | null;
}

export type CreatePageInput = Omit<
  Page,
  "Id" | "CreatedAt" | "UpdatedAt" | "DeletedAt"
> & {
  Id?: string;
  CreatedAt?: Date;
  UpdatedAt?: Date;
  DeletedAt?: Date | null;
};

export type UpdatePageInput = Partial<Omit<Page, "Id">> & {
  Id: string;
};

export type PageCreateInput = SchemaCreatePageInput;
export type { PageStyleValue };
