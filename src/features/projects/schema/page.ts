import z from "zod";

const flatJsonValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

const flatJsonRecordSchema = z.record(z.string(), flatJsonValueSchema);

const pageShape = {
  Id: z.string().optional(),
  Name: z.string(),
  Type: z.string(),
  Styles: flatJsonRecordSchema.nullable(),
  ProjectId: z.string(),
  CreatedAt: z.date().optional(),
  UpdatedAt: z.date().optional(),
  DeletedAt: z.date().nullable().optional(),
} satisfies z.ZodRawShape;

const createPageShape = {
  Id: z.string().optional(),
  Name: z.string().min(1),
  Type: z.string().default("page"),
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
