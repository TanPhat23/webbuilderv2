import { z } from "zod";

export const marketplaceItemSchema = z.object({
  projectId: z
    .string()
    .min(1, "Please select a project to base this template on"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must not exceed 2000 characters"),
  preview: z.string().optional(),
  templateType: z.enum(["full-site", "page", "section", "block"]),
  featured: z.boolean(),
  pageCount: z.number().int().positive().optional(),
  tags: z
    .array(z.string())
    .max(10, "Maximum 10 tags allowed"),
  categoryIds: z.array(z.string()).optional(),
});

export type MarketplaceItemFormValues = z.infer<typeof marketplaceItemSchema>;
