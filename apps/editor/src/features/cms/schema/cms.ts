import z from "zod";

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
  ContentTypeFormSchema,
  ContentFieldFormSchema,
  ContentItemFormSchema,
};
