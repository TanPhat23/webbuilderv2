import z from "zod";

const SettingSchema = z.object({
  Id: z.string(),
  Name: z.string(),
  SettingType: z.string(),
  Settings: z.record(z.string(), z.any()), // Json type in Prisma
  ElementId: z.string(),
  CreatedAt: z.date().optional(),
  UpdatedAt: z.date().optional(),
  DeletedAt: z.date().optional().nullable(),
});

export { SettingSchema };
