import z from "zod";

const ElementSchema = z.object({
  Id: z.string().optional(),
  Type: z.string().min(1, "Type is required"),
  Content: z.string().optional().nullable(),
  Name: z.string().optional().nullable(),
  Styles: z.record(z.string(), z.unknown()).optional().nullable(), // Json type
  TailwindStyles: z.string().optional().nullable(),
  Src: z.string().optional().nullable(),
  Href: z.string().optional().nullable(),
  ParentId: z.string().optional().nullable(),
  PageId: z.string().optional().nullable(),
  ProjectId: z.string(),
  Order: z.number().optional().default(0),
  CreatedAt: z.date().optional(),
  UpdatedAt: z.date().optional(),
  DeletedAt: z.date().optional().nullable(),
});

export { ElementSchema };
