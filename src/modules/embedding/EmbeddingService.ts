import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { UserType } from "../../../prisma/generated/schemas/models/User.schema";
import DatabaseService from "../database/DatabaseService";
import { EntityType } from "../../../prisma/generated/schemas";
import { TaskType } from "../../../prisma/generated/schemas/models/Task.schema";
import { capitalize, omit } from "lodash";
import { BASE_KEYS } from "@/constants";
import { Prisma } from "@prisma/client";

export default class EmbeddingService {
  static async generateEmbedding(value: string): Promise<number[]> {
    const { embedding } = await embed({
      model: openai.textEmbeddingModel("text-embedding-3-small"),
      value,
    });

    return embedding;
  }

  static generateEntityEmbedding = async (
    entityType: EntityType,
    entityId: UserType["id"] | TaskType["id"],
  ) => {
    const entity = await DatabaseService.prisma[
      entityType as "user"
    ].findUnique({
      where: { id: entityId },
    });
    const capitalizedEntityType = capitalize(entityType);
    if (!entity) throw new Error(`${capitalizedEntityType} not found`);

    const embedding = await this.generateEmbedding(
      Object.values(omit(entity, BASE_KEYS))
        .filter((v) => typeof v === "string")
        .join(" "),
    );

    await DatabaseService.prisma.$executeRawUnsafe(
      `
    UPDATE "${capitalizedEntityType}" 
    SET embedding = $1::vector
    WHERE id = $2
    `,
      `[${embedding.join(",")}]`,
      entityId,
    );

    return embedding;
  };

  static async vectorSearch<T>(
    entityType: EntityType,
    query: string,
    limit: number = 10,
    similarityThreshold: number = 0.4,
  ) {
    const queryEmbedding = await this.generateEmbedding(query);
    const capitalizedEntityType = capitalize(entityType);

    const results = await DatabaseService.prisma.$queryRaw<
      (T & { similarity: number })[]
    >`
    SELECT
      *,
      1 - (embedding <=> ${`[${queryEmbedding.join(",")}]`}::vector) as similarity
    FROM ${Prisma.raw(`"${capitalizedEntityType}"`)}
    WHERE embedding IS NOT NULL
      AND 1 - (embedding <=> ${`[${queryEmbedding.join(",")}]`}::vector) > ${similarityThreshold}
    ORDER BY embedding <=> ${`[${queryEmbedding.join(",")}]`}::vector
    LIMIT ${limit}
  `;

    console.log(
      "Semantic search results:",
      results.map((item) => omit(item, ["embedding"])),
    );

    return results.map((item) => omit(item, ["embedding"]));
  }
}
