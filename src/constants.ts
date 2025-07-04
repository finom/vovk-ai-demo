import type { BaseEntity } from "./types";

export const BASE_FIELDS = {
  id: true,
  entityType: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies { [key in keyof BaseEntity]: true };

export const BASE_KEYS = Object.keys(
  BASE_FIELDS,
) as (keyof typeof BASE_FIELDS)[];
