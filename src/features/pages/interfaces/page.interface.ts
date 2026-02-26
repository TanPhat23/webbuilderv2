export interface Page {
  Id: string;
  Name: string;
  Type: string;
  Styles: Record<string, unknown> | null;
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
