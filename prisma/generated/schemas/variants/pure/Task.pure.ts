import { z } from 'zod';

import { EntityTypeSchema } from '../../enums/EntityType.schema';
import { TaskStatusSchema } from '../../enums/TaskStatus.schema';
// prettier-ignore
export const TaskModelSchema = z.object({
    id: z.string(),
    entityType: EntityTypeSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
    title: z.string(),
    description: z.string(),
    status: TaskStatusSchema,
    userId: z.string(),
    user: z.unknown()
}).strict();

export type TaskModelType = z.infer<typeof TaskModelSchema>;
