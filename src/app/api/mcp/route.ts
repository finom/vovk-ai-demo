import { createMcpHandler } from "@vercel/mcp-adapter";
import { createLLMTools } from "vovk";
import UserController from "@/modules/user/UserController";
import TaskController from "@/modules/task/TaskController";
import { convertJsonSchemaToZod } from "zod-from-json-schema";
import { mapValues } from "lodash";

const { tools } = createLLMTools({
  modules: {
    UserController,
    TaskController,
  },
  resultFormatter: "mcp",
  onExecute: (result, { moduleName, handlerName, body, query, params }) =>
    console.log(`${moduleName}.${handlerName} executed`, {
      body,
      query,
      params,
      result,
    }),
  onError: (e) => console.error("Error", e),
});

const handler = createMcpHandler(
  (server) => {
    tools.forEach(({ name, execute, description, parameters }) => {
      server.tool(
        name,
        description,
        mapValues(parameters?.properties ?? {}, convertJsonSchemaToZod),
        execute,
      );
    });
  },
  {},
  { basePath: "/api" },
);

export { handler as GET, handler as POST, handler as DELETE };
