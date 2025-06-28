import { createMcpHandler } from "@vercel/mcp-adapter";
import { createLLMTools, KnownAny } from "vovk";
import UserController from "@/modules/user/UserController";
import TaskController from "@/modules/task/TaskController";
import { convertJsonSchemaToZod } from 'zod-from-json-schema';

console.log(UserController.updateUser.models)

const { tools } = createLLMTools({
  meta: { isMCP: true },
  modules: {
    UserController,
    TaskController,
  },
  onExecute: (_d, { moduleName, handlerName }) =>
    console.log(`${moduleName}.${handlerName} executed`),
  onError: (e) => console.error("Error", e),
});

const handler = createMcpHandler(
  (server) => {
    tools.forEach(({ name, execute, description, models }) => {
      server.tool(
        name,
        description,
        // jsonSchema(parameters as KnownAny),
        /* parameters?.properties
          ? mapValues(parameters.properties, jsonSchema)
          : {}, */
        /* parameters?.properties
          ? mapValues(parameters.properties, convertJsonSchemaToZod)
          : {
  type: "object",
} as const, */
        models as KnownAny ?? {},
        execute,
      );
    });

    server.tool(
      "roll_dice",
      "Rolls an N-sided die",
      // { sides: z.number().int().min(2) },
      /* jsonSchema({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          sides: {
            type: 'number',
            minimum: 2,
            description: 'Number of sides on the die',
          },
        },
        required: ['sides'],
        additionalProperties: false,
      }), */
      {
        sides: convertJsonSchemaToZod({
          type: "number",
          minimum: 2,
          description: "Number of sides on the die",
        }),
      },
     // { sides: jsonSchema({ type: "number", minimum: 2, description: "Number of sides on the die" }) },
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
