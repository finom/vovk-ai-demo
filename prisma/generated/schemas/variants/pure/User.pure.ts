import { z } from 'zod';

import { EntityTypeSchema } from '../../enums/EntityType.schema';
// prettier-ignore
export const UserModelSchema = z.object({
    id: z.string(),
    entityType: EntityTypeSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
    fullName: z.string(),
    email: z.string(),
    imageUrl: z.string().nullable(),
    tasks: z.array(z.unknown()).array()
}).strict();

export type UserModelType = z.infer<typeof UserModelSchema>;
