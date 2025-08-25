import * as z from "zod/v3";
import { EntityType } from "@prisma/client";

export const UserModel = z.object({
  id: z
    .string()
    .uuid()
    .transform((val) => val as string & { e: typeof EntityType.user }),
  entityType: z.literal(EntityType.user),
  createdAt: z.date(),
  updatedAt: z.date(),
  fullName: z.string(),
  email: z.string(),
  imageUrl: z.string().nullish(),
});
