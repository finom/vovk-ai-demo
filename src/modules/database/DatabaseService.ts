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
    return (this.#client ??= this.getClient());
  }
  static #client: ReturnType<typeof DatabaseService.getClient> | null = null;

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
            const result = (await query(args)) as BaseEntity;
            if (!result?.entityType) return result;

            const now = new Date().toISOString();
            const changes: DBChange[] = [];

            const makeChange = (
              entity: BaseEntity,
              type: DBChange["type"],
            ) => ({
              id: entity.id,
              entityType: entity.entityType,
              date:
                type === "delete" ? now : (entity.updatedAt?.toString() ?? now),
              type,
            });

            switch (operation) {
              case "create":
                if (result.id) changes.push(makeChange(result, "create"));
                break;

              case "update":
                if (result.id) changes.push(makeChange(result, "update"));
                break;

              case "delete":
                if (result.id) changes.push(makeChange(result, "delete"));
                break;

              // other operations like deleteMany should be implemented separately

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
