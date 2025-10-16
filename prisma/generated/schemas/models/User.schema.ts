import { z } from 'zod';
import { EntityTypeSchema } from '../enums/EntityType.schema';

export const UserSchema = z.object({
  id: z.uuid().brand<Extract<z.infer<typeof EntityTypeSchema>, 'user'>>(),
  entityType: z.literal('user').default("user"),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
  fullName: z.string().meta({ example: "John Doe", description: "Full name of the user" }),
  email: z.string().meta({ example: "john.doe@example.com", description: "Email address of the user" }),
  imageUrl: z.string().meta({ example: "https://example.com/image.jpg", description: "Profile image URL of the user" }).nullish(),
});

export type UserType = z.infer<typeof UserSchema>;
