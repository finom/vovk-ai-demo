import { EntityType } from "@prisma/client";
import mitt from "mitt";
import { createClient } from "redis";

export type DBChange = {
  id: string;
  entityType: EntityType;
  date: string;
  type: "create" | "update" | "delete";
};

export default class DatabaseEventsService {
  public static readonly DB_KEY = "db_updates";

  private static readonly INTERVAL = 1_000;
  private static lastTimestamp = Date.now();

  private static redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  public static emitter = mitt<{
    [DatabaseEventsService.DB_KEY]: DBChange[];
  }>();

  // ensure Redis is connected
  private static async connect() {
    if (!this.redisClient.isOpen) {
      await this.redisClient.connect();
      this.redisClient.on("error", (err) => {
        console.error("Redis Client Error", err);
      });
    }
  }

  // push one update into our ZSET, with score = timestamp
  public static async createChanges(changes: DBChange[]) {
    if (changes.length === 0) return;

    await this.connect();

    // build array of { score, value } objects
    const entries = changes.map(({ id, entityType, type, date }) => ({
      score: Date.now(),
      value: JSON.stringify({ id, entityType, date, type }),
    }));

    // one multi(): batch ZADD + EXPIRE
    await this.redisClient
      .multi()
      .zAdd(this.DB_KEY, entries)
      .expire(this.DB_KEY, (this.INTERVAL * 60) / 1000)
      .exec();
  }

  public static beginEmitting() {
    setInterval(async () => {
      await this.connect();

      const now = Date.now();

      // get everything with score ∈ (lastTimestamp, now]
      const raw = await this.redisClient.zRangeByScore(
        this.DB_KEY,
        this.lastTimestamp + 1,
        now,
      );

      this.lastTimestamp = now;

      if (raw.length > 0) {
        const updates = raw.map((s) => JSON.parse(s) as DBChange);
        this.emitter.emit(this.DB_KEY, updates);
      }
    }, this.INTERVAL);
  }
}
