import z from "zod";

const ImageSchema = z.object({
  ImageId: z.string(),
  ImageName: z.string().optional().nullable(),
  UserId: z.string(),
  ImageLink: z.string().default(""),
  CreatedAt: z.date().optional(),
  UpdatedAt: z.date().optional(),
  DeletedAt: z.date().optional().nullable(),
});

export { ImageSchema };
