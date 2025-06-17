import * as z from "zod";
import { EntityType, TaskStatus } from "@prisma/client";

export const TaskModel = z.object({
  id: z
    .string()
    .uuid()
    .transform((val) => val as string & { e: typeof EntityType.tasks }),
  entityType: z.literal(EntityType.tasks),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string(),
  description: z.string(),
  status: z.nativeEnum(TaskStatus),
  userId: z
    .string()
    .uuid()
    .transform((val) => val as string & { e: typeof EntityType.users }),
});
