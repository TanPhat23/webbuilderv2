import z from "zod";

const ContentTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

const ContentFieldSchema = z.object({
  id: z.string().optional(),
  contentTypeId: z.string(),
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  required: z.boolean().default(false),
});

const ContentItemSchema = z.object({
  id: z.string().optional(),
  contentTypeId: z.string(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  published: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

const ContentTypeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const ContentFieldFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  required: z.boolean(),
});

const ContentItemFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  published: z.boolean(),
});

export {
  ContentTypeSchema,
  ContentFieldSchema,
  ContentItemSchema,
  ContentTypeFormSchema,
  ContentFieldFormSchema,
  ContentItemFormSchema,
};
