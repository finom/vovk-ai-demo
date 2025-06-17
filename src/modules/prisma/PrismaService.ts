import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

// if we're running locally
if (!process.env.VERCEL_ENV) {
  // Set the WebSocket proxy to work with the local instance
  neonConfig.wsProxy = (host) => `${host}:5433/v1`;
  // Disable all authentication and encryption
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
}

export default class PrismaService {
  static get client() {
    return this.getClient();
  }

  static getClient() {
    if (
      !(process.env.POSTGRES_PRISMA_URL as string).includes(
        "postgres:password@localhost:",
      ) &&
      process.env.NODE_ENV !== "production"
    ) {
      console.warn("\x1b[31mRunning Production DB\x1b[0m");
    }

    const adapter = new PrismaNeon({
      connectionString: `${process.env.POSTGRES_PRISMA_URL}`,
    });
    const prisma = new PrismaClient({ adapter });

    return prisma;
  }
}
