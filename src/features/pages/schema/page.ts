import z from "zod";

const flatJsonValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

const flatJsonRecordSchema = z.record(z.string(), flatJsonValueSchema);

export const PageTypeSchema = z.enum(["sp", "dp", "cp"]);
export type PageType = z.infer<typeof PageTypeSchema>;

const pageShape = {
  Id: z.string().optional(),
  Name: z.string(),
  Slug: z.string().optional(),
  Type: PageTypeSchema,
  ContentTypeId: z.string().nullable().optional(),
  Styles: flatJsonRecordSchema.nullable(),
  ProjectId: z.string(),
  CreatedAt: z.date().optional(),
  UpdatedAt: z.date().optional(),
  DeletedAt: z.date().nullable().optional(),
} satisfies z.ZodRawShape;

const createPageShape = {
  Id: z.string().optional(),
  Name: z.string().min(1),
  Slug: z.string().max(255).optional(),
  Type: PageTypeSchema.default("sp"),
  ContentTypeId: z.string().max(255).nullable().optional(),
  Styles: flatJsonRecordSchema.nullable().default(null),
  ProjectId: z.string(),
} satisfies z.ZodRawShape;

const PageSchema = z.object(pageShape);
const CreatePageSchema = z.object(createPageShape);

export type JsonValue = z.infer<typeof flatJsonValueSchema>;
export type JsonRecord = z.infer<typeof flatJsonRecordSchema>;
export type PageInput = z.infer<typeof PageSchema>;
export type CreatePageInput = z.infer<typeof CreatePageSchema>;

export {
  flatJsonValueSchema,
  flatJsonRecordSchema,
  PageSchema,
  CreatePageSchema,
};
