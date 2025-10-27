import { EntityType } from "../prisma/generated/client";

export interface BaseEntity {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  entityType: EntityType;
}
