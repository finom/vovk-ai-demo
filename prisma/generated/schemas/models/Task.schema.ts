import { z } from 'zod';
import { EntityTypeSchema } from '../enums/EntityType.schema';
import { TaskStatusSchema } from '../enums/TaskStatus.schema';

export const TaskSchema = z.object({
  id: z.uuid().brand<Extract<z.infer<typeof EntityTypeSchema>, 'task'>>(),
  entityType: z.literal('task').default("task"),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
  title: z.string(),
  description: z.string(),
  status: TaskStatusSchema.default("TODO"),
  userId: z.string().uuid().brand<Extract<z.infer<typeof EntityTypeSchema>, 'user'>>(),
});

export type TaskType = z.infer<typeof TaskSchema>;
