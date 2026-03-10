import z from "zod";

const jsonValueSchema: z.ZodType<
  string | number | boolean | null | Record<string, unknown> | unknown[]
> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.record(z.string(), jsonValueSchema),
    z.array(jsonValueSchema),
  ]),
);

const jsonRecordSchema = z.record(z.string(), jsonValueSchema);

const headerShape = {
  cssStyles: z.string().optional(),
} satisfies z.ZodRawShape;

const headerSchema = z.object(headerShape);

const projectShape = {
  Id: z.string().optional(),
  Name: z.string().min(1, "Name is required"),
  Description: z.string().optional().nullable(),
  OwnerId: z.string(),
  Published: z.boolean().optional().default(false),
  Subdomain: z.string().optional().nullable(),
  Styles: jsonRecordSchema.optional(), // Json type
  Header: headerSchema.optional().nullable(),
  CreatedAt: z.date().optional(),
  UpdatedAt: z.date().optional(),
  DeletedAt: z.date().optional().nullable(),
} satisfies z.ZodRawShape;

const projectIdShape = {
  projectId: z.string(),
} satisfies z.ZodRawShape;

const createProjectShape = {
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
} satisfies z.ZodRawShape;

const projectUpdateFieldsShape = {
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  published: z.boolean().optional(),
  subdomain: z.string().nullable().optional(),
  styles: jsonRecordSchema.nullable().optional(),
  header: headerSchema.nullable().optional(),
} satisfies z.ZodRawShape;

const updateProjectShape = {
  projectId: z.string(),
  updates: z.object(projectUpdateFieldsShape),
} satisfies z.ZodRawShape;

const ProjectSchema = z.object(projectShape);

const ProjectIdSchema = z.object(projectIdShape);

const CreateProjectSchema = z.object(createProjectShape);

const UpdateProjectSchema = z.object(updateProjectShape);

export type JsonValue = z.infer<typeof jsonValueSchema>;
export type JsonRecord = z.infer<typeof jsonRecordSchema>;
export type ProjectHeader = z.infer<typeof headerSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type ProjectUpdateFields = z.infer<
  z.ZodObject<typeof projectUpdateFieldsShape>
>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type ProjectIdInput = z.infer<typeof ProjectIdSchema>;
export type ProjectUpdateFieldKeys = keyof ProjectUpdateFields;

export {
  jsonValueSchema,
  jsonRecordSchema,
  headerSchema,
  ProjectSchema,
  ProjectIdSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
};
