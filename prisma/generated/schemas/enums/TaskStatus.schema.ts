import { z } from 'zod';

export const TaskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])

export type TaskStatus = z.infer<typeof TaskStatusSchema>;