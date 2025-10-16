import { z } from 'zod';
import { EntityTypeSchema } from '../enums/EntityType.schema';
import { TaskStatusSchema } from '../enums/TaskStatus.schema';

export const TaskSchema = z.object({
  id: z.uuid().brand<Extract<z.infer<typeof EntityTypeSchema>, 'task'>>(),
  entityType: z.literal('task').default("task"),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
  title: z.string().meta({ example: "Implement authentication", description: "Title of the task" }),
  description: z.string().meta({ example: "Implement user authentication using JWT", description: "Description of the task" }),
  status: TaskStatusSchema.default("TODO").meta({ example: "TODO", description: "Status of the task" }),
  userId: z.uuid().brand<Extract<z.infer<typeof EntityTypeSchema>, 'user'>>().meta({ example: "a3bb189e-8bf9-3888-9912-ace4e6543002", description: "ID of the user who owns the task" }),
});

export type TaskType = z.infer<typeof TaskSchema>;
