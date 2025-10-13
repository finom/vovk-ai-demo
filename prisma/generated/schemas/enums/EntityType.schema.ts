import { z } from "zod";

export const EntityTypeSchema = z.enum(["user", "task"]);

export type EntityType = z.infer<typeof EntityTypeSchema>;
