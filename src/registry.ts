import { EntityType } from "@prisma/client";
import { z } from "zod/v3";
import { create } from "zustand";
import fastDeepEqual from "fast-deep-equal";
import { TaskModel, UserModel } from "./zod";
import { BaseEntity } from "./types";

export type UserModelType = z.infer<typeof UserModel>;
export type TaskModelType = z.infer<typeof TaskModel>;

interface Registry {
  parse: (data: unknown) => Partial<{
    [key in EntityType]: BaseEntity[];
  }>;
  [EntityType.users]: Record<UserModelType["id"], UserModelType>;
  [EntityType.tasks]: Record<TaskModelType["id"], TaskModelType>;
}

function getEntitiesFromResponse(
  data: unknown,
  entities: Partial<{ [key in EntityType]: BaseEntity[] }> = {},
) {
  if (Array.isArray(data)) {
    data.forEach((item) => getEntitiesFromResponse(item, entities));
  } else if (typeof data === "object" && data !== null) {
    Object.values(data).forEach((value) =>
      getEntitiesFromResponse(value, entities),
    );
    if ("entityType" in data && "id" in data) {
      const entityType = data.entityType as EntityType;
      entities[entityType] ??= [];
      entities[entityType].push(data as BaseEntity);
    }
  }
  return entities;
}

export const useRegistry = create<Registry>((set) => ({
  [EntityType.users]: {},
  [EntityType.tasks]: {},
  parse: (data: unknown) => {
    const entities = getEntitiesFromResponse(data);
    set((state) => {
      const newState: Record<string, unknown> = {};
      Object.entries(entities).forEach(([entityType, entityList]) => {
        const type = entityType as EntityType;
        const descriptors = Object.getOwnPropertyDescriptors(state[type] ?? {});
        entityList.forEach((entity) => {
          descriptors[entity.id] =
            descriptors[entity.id]?.value &&
            fastDeepEqual(descriptors[entity.id]?.value, entity)
              ? descriptors[entity.id]
              : ({
                  value: { ...descriptors[entity.id]?.value, ...entity },
                  configurable: true,
                  writable: false,
                } satisfies PropertyDescriptor);
          descriptors[entity.id].enumerable = !("__isDeleted" in entity);
        });
        newState[type] = Object.defineProperties({}, descriptors);
      });
      const resultState = { ...state, ...newState };
      return resultState;
    });
    return entities;
  },
}));

export const BASE_FIELDS = {
  id: true,
  entityType: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies { [key in keyof BaseEntity]: true };

export const BASE_KEYS = Object.keys(
  BASE_FIELDS,
) as (keyof typeof BASE_FIELDS)[];
