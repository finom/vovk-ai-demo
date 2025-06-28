import { createMcpHandler } from "@vercel/mcp-adapter";
import { createLLMTools, KnownAny } from "vovk";
import UserController from "@/modules/user/UserController";
import TaskController from "@/modules/task/TaskController";
import { jsonSchema } from "ai";
import { z } from "zod";

const { tools } = createLLMTools({
  meta: { isMCP: true },
  modules: {
    UserController,
    TaskController,
  },
  onExecute: (_d, { moduleName, handlerName }) => console.log(`${moduleName}.${handlerName} executed`),
  onError: (e) => console.error("Error", e),
});

const handler = createMcpHandler(
  (server) => {
    tools.forEach(({ name, execute, description, parameters }) => {
      server.tool(
        name,
        description,
        jsonSchema(parameters as KnownAny),
        execute,
      );
    });

    server.tool(
      "roll_dice",
      "Rolls an N-sided die",
      { sides: z.number().int().min(2) },
      async ({ sides }) => {
        const value = 1 + Math.floor(Math.random() * sides);
        return {
          content: [{ type: "text", text: `🎲 You rolled a ${value}!` }],
        };
      },
    );
  },
  {},
  { basePath: "/api" },
);

export { handler as GET, handler as POST, handler as DELETE };
