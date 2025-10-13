import { z } from "zod";

import { EntityTypeSchema } from "../../enums/EntityType.schema";
import { TaskStatusSchema } from "../../enums/TaskStatus.schema";
// prettier-ignore
export const TaskModelSchema = z.object({
    id: z.string(),
    entityType: EntityTypeSchema,
    createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
    title: z.string(),
    description: z.string(),
    status: TaskStatusSchema,
    userId: z.string(),
    user: z.any()
}).strict();

export type TaskModelType = z.infer<typeof TaskModelSchema>;
