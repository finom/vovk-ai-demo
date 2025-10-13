import { z } from "zod";

import { EntityTypeSchema } from "../../enums/EntityType.schema";
// prettier-ignore
export const UserModelSchema = z.object({
    id: z.string(),
    entityType: EntityTypeSchema,
    createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
    fullName: z.string(),
    email: z.string(),
    imageUrl: z.string().nullable(),
    tasks: z.array(z.any()).array()
}).strict();

export type UserModelType = z.infer<typeof UserModelSchema>;
