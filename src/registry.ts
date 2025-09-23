import { EntityType } from "@prisma/client";
import { create } from "zustand";
import fastDeepEqual from "fast-deep-equal";
import { BaseEntity } from "./types";
import { UserType } from "../prisma/generated/schemas/models/User.schema";
import { TaskType } from "../prisma/generated/schemas/models/Task.schema";

// Utility type to convert record to array
type RecordsToArrays<T> = {
  [K in keyof T]: T[K] extends Record<string, infer V> ? V[] : T[K];
};

interface Registry {
  parse: (data: unknown) => Partial<{
    [key in EntityType]: BaseEntity[];
  }>;
  sync: (
    initialData: Partial<
      RecordsToArrays<Omit<Registry, "parse" | "sync" | "values">>
    >,
  ) => boolean;
  values: (
    initialData?: Partial<
      RecordsToArrays<Omit<Registry, "parse" | "sync" | "values">>
    >,
  ) => RecordsToArrays<Omit<Registry, "parse" | "sync" | "values">>;
  [EntityType.user]: Record<UserType["id"], UserType>;
  [EntityType.task]: Record<TaskType["id"], TaskType>;
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

const synced: Partial<Record<EntityType, boolean>> = {};

export const useRegistry = create<Registry>((set, get) => ({
  [EntityType.user]: {},
  [EntityType.task]: {},
  parse: (data) => {
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
  sync: (initialData) => {
    const toBeParsed: Partial<{
      [key in EntityType]: BaseEntity[];
    }> = {};
    const state = get();

    Object.entries(initialData).forEach(([entityType, entities]) => {
      const type = entityType as EntityType;
      if (!synced[type]) {
        toBeParsed[type] = entities;
        synced[type] = true;
      }
    });

    // Parse the entities to update the state
    if (Object.keys(toBeParsed).length > 0) {
      state.parse(toBeParsed);
      return true;
    }

    return false;
  },
  values: (initialData = {}) => {
    const state = get();
    const result: Partial<
      RecordsToArrays<Omit<Registry, "parse" | "sync" | "values">>
    > = {};
    Object.keys(EntityType).forEach((key) => {
      const entityType = key as EntityType;
      if (synced[entityType]) {
        result[entityType] = Object.values(state[entityType]);
      } else {
        result[entityType] =
          initialData[entityType] || Object.values(state[entityType]);
      }
    });
    return result as RecordsToArrays<
      Omit<Registry, "parse" | "sync" | "values">
    >;
  },
}));
