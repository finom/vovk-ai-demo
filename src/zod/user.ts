import * as z from "zod";
import { EntityType } from "@prisma/client";

export const UserModel = z.object({
  id: z
    .string()
    .uuid()
    .transform((val) => val as string & { e: typeof EntityType.users }),
  entityType: z.literal(EntityType.users),
  createdAt: z.date(),
  updatedAt: z.date(),
  fullName: z.string(),
  email: z.string(),
  imageUrl: z.string().nullish(),
});
