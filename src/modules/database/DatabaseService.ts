// prismaService.ts
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import DBEventsService, { DBChange } from "./DatabaseEventsService";
import { BaseEntity } from "@/types";

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
    const adapter = new PrismaNeon({
      connectionString: `${process.env.DATABASE_URL}`,
    });
    const prisma = new PrismaClient({ adapter });

    DBEventsService.startPolling();

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
            const changes: DBChange[] = [];

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

            switch (operation) {
              case "create" satisfies AllowedOperation:
                if ("entityType" in result)
                  changes.push(makeChange(result, "create"));
                break;

              case "update" satisfies AllowedOperation:
                if ("entityType" in result)
                  changes.push(makeChange(result, "update"));
                break;

              case "delete" satisfies AllowedOperation:
                if ("entityType" in result) {
                  changes.push(makeChange(result, "delete"));
                  // Automatically add __isDeleted flag to deletion results
                  Object.assign(result, { __isDeleted: true });
                }
                break;

              case "findMany" satisfies AllowedOperation:
              case "findUnique" satisfies AllowedOperation:
              case "findFirst" satisfies AllowedOperation:
              case "count" satisfies AllowedOperation:
                // no events
                break;

              default:
                console.warn(
                  `Unhandled Prisma operation: ${operation} for model: ${model}`,
                );
                break;
            }

            if (changes.length) {
              await DBEventsService.write(changes);
            }

            return result;
          },
        },
      },
    });
  }
}
