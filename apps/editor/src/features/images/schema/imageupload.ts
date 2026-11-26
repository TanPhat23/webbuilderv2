import { z } from "zod";

// Image file validation schema
export const ImageFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.type.startsWith("image/"), {
      message: "File must be an image",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Image must be less than 5MB",
    }),
  imageName: z.string().optional(),
});

// Base64 image validation schema
export const Base64ImageSchema = z.object({
  base64: z
    .string()
    .min(1, "Base64 string is required")
    .refine(
      (str) => {
        // Check if it's a valid base64 string
        const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
        return base64Regex.test(str);
      },
      {
        message: "Invalid base64 image format",
      }
    )
    .refine(
      (str) => {
        // Rough estimate: base64 is ~1.37x larger than binary
        const base64Length = str.length - str.indexOf(",") - 1;
        const sizeInBytes = (base64Length * 3) / 4;
        return sizeInBytes <= 5 * 1024 * 1024;
      },
      {
        message: "Base64 image must be less than 5MB",
      }
    ),
  imageName: z.string().optional(),
});

// Image upload response validation
export const ImageUploadResponseSchema = z.object({
  imageId: z.string(),
  imageLink: z.string().url(),
  imageName: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
});

// Image validation
export const ImageSchema = z.object({
  imageId: z.string(),
  imageLink: z.string().url(),
  imageName: z.string().nullable().optional(),
  userId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable().optional(),
});

// Array of images
export const ImagesArraySchema = z.array(ImageSchema);

// Image drag data schema
export const ImageDragDataSchema = z.object({
  imageId: z.string(),
  imageLink: z.string().url(),
  imageName: z.string().nullable().optional(),
  type: z.literal("image"),
});

// Types
export type ImageFileInput = z.infer<typeof ImageFileSchema>;
export type Base64ImageInput = z.infer<typeof Base64ImageSchema>;
export type ImageUploadResponse = z.infer<typeof ImageUploadResponseSchema>;
export type ImageData = z.infer<typeof ImageSchema>;
export type ImagesArray = z.infer<typeof ImagesArraySchema>;
export type ImageDragData = z.infer<typeof ImageDragDataSchema>;
