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
  private static readonly DB_KEY = "db_updates";
  private static readonly INTERVAL = 1_000;
  private static lastTimestamp = Date.now();

  private static redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  // our in‑process event emitter
  public static emitter = mitt<{
    db_updates: DBChange[];
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
  public static async write(changes: DBChange[]) {
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

  // start polling loop
  public static startPolling() {
    setInterval(async () => {
      await this.connect();

      const now = Date.now();

      // 1 single command: get everything with score ∈ (lastTimestamp, now]
      const raw = await this.redisClient.zRangeByScore(
        this.DB_KEY,
        this.lastTimestamp + 1,
        now,
      );

      if (raw.length > 0) {
        const updates = raw.map((s) => JSON.parse(s) as DBChange);

        // advance our cursor
        this.lastTimestamp = now;

        // emit
        this.emitter.emit("db_updates", updates);
      }
    }, this.INTERVAL);
  }
}
