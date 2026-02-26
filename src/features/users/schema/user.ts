import z from "zod";

const UserSchema = z.object({
  Id: z.string().optional(),
  Email: z.string().email("Invalid email address"),
  FirstName: z.string().optional().nullable(),
  LastName: z.string().optional().nullable(),
  ImageUrl: z.string().optional().nullable(),
  CreatedAt: z.date().optional(),
  UpdatedAt: z.date().optional(),
});

export { UserSchema };
