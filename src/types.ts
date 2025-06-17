import { EntityType } from "@prisma/client";

export interface BaseEntity {
  id: string & { e: string };
  createdAt: Date;
  updatedAt: Date;
  entityType: EntityType;
}
