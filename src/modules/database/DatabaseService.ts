import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import DatabaseEventsService, { type DBChange } from "./DatabaseEventsService";
import type { BaseEntity } from "@/types";

if (!process.env.VERCEL_ENV) {
  neonConfig.wsProxy = (host) => `${host}:5433/v1`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
}

export default class DatabaseService {
  static get prisma() {
    return (this.#prisma ??= this.getClient());
  }
  static #prisma: ReturnType<typeof DatabaseService.getClient> | null = null;

  private static getClient() {
    const prisma = new PrismaClient({
      adapter: new PrismaNeon({
        connectionString: `${process.env.DATABASE_URL}`,
      }),
    });

    DatabaseEventsService.beginEmitting();

    return prisma.$extends({
      name: "events",
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const allowedOperations = [
              "create",
              "update",
              "delete",
              "findMany",
              "findUnique",
              "findFirst",
              "count",
            ] as const;
            type AllowedOperation = (typeof allowedOperations)[number];
            if (!allowedOperations.includes(operation as AllowedOperation)) {
              throw new Error(
                `Unsupported database operation "${operation}" on model "${model}"`,
              );
            }
            const result = (await query(args)) as BaseEntity | BaseEntity[];

            const now = new Date().toISOString();
            let change: DBChange | null = null;

            const makeChange = (
              entity: BaseEntity,
              type: DBChange["type"],
            ) => ({
              id: entity.id,
              entityType: entity.entityType,
              date:
                type === "delete"
                  ? now
                  : entity.updatedAt
                    ? new Date(entity.updatedAt).toISOString()
                    : now,
              type,
            });

            switch (operation as AllowedOperation) {
              case "create":
                if ("entityType" in result)
                  change = makeChange(result, "create");
                break;

              case "update":
                if ("entityType" in result)
                  change = makeChange(result, "update");
                break;

              case "delete":
                if ("entityType" in result) {
                  change = makeChange(result, "delete");
                  // Automatically add __isDeleted flag to deletion results
                  Object.assign(result, { __isDeleted: true });
                }
                break;

              case "findMany":
              case "findUnique":
              case "findFirst":
              case "count":
                // no events
                break;

              default:
                console.warn(
                  `Unhandled Prisma operation: ${operation} for model: ${model}`,
                );
                break;
            }

            if (change) {
              await DatabaseEventsService.createChanges([change]);
            }

            return result;
          },
        },
      },
    });
  }
}
