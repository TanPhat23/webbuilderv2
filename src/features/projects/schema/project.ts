import z from "zod";

const ProjectSchema = z.object({
  Id: z.string().optional(),
  Name: z.string().min(1, "Name is required"),
  Description: z.string().optional().nullable(),
  OwnerId: z.string(),
  Published: z.boolean().optional().default(false),
  Subdomain: z.string().optional().nullable(),
  Styles: z.record(z.string(), z.unknown()).optional(), // Json type
  CreatedAt: z.date().optional(),
  UpdatedAt: z.date().optional(),
  DeletedAt: z.date().optional().nullable(),
});

export { ProjectSchema };
