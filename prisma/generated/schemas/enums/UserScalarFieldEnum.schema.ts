import { z } from 'zod';

export const UserScalarFieldEnumSchema = z.enum(['id', 'entityType', 'createdAt', 'updatedAt', 'fullName', 'email', 'imageUrl'])

export type UserScalarFieldEnum = z.infer<typeof UserScalarFieldEnumSchema>;