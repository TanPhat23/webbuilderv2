import z from "zod";

const ElementSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  content: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  styles: z.record(z.string(), z.unknown()).optional().nullable(), // Json type
  tailwindStyles: z.string().optional().nullable(),
  src: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  pageId: z.string().optional().nullable(),
  projectId: z.string(),
  order: z.number().optional().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
});

export { ElementSchema };
