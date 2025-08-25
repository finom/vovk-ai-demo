import * as z from "zod/v3";
import { EntityType, TaskStatus } from "@prisma/client";

export const TaskModel = z.object({
  id: z
    .string()
    .uuid()
    .transform((val) => val as string & { e: typeof EntityType.task }),
  entityType: z.literal(EntityType.task),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string(),
  description: z.string(),
  status: z.nativeEnum(TaskStatus),
  userId: z
    .string()
    .uuid()
    .transform((val) => val as string & { e: typeof EntityType.user }),
});
