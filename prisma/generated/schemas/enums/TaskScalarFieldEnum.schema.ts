import { z } from 'zod';

export const TaskScalarFieldEnumSchema = z.enum(['id', 'entityType', 'createdAt', 'updatedAt', 'title', 'description', 'status', 'userId'])

export type TaskScalarFieldEnum = z.infer<typeof TaskScalarFieldEnumSchema>;