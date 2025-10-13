import { z } from "zod";
import { EntityTypeSchema } from "../enums/EntityType.schema";

export const UserSchema = z.object({
  id: z.uuid().brand<{} & Extract<z.infer<typeof EntityTypeSchema>, "user">>(),
  entityType: z.literal("user").default("user"),
  createdAt: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      "Invalid ISO datetime",
    ),
  updatedAt: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      "Invalid ISO datetime",
    ),
  fullName: z.string(),
  email: z.string(),
  imageUrl: z.string().nullish(),
});

export type UserType = z.infer<typeof UserSchema>;
