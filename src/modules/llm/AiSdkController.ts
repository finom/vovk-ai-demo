import {
  createLLMFunctions,
  HttpException,
  HttpStatus,
  KnownAny,
  post,
  prefix,
  type VovkRequest,
} from "vovk";
import { openapi } from "vovk-openapi";
import { jsonSchema, streamText, tool, type CoreMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import UserController from "../user/UserController";
import TaskController from "../task/TaskController";

@prefix("ai-sdk")
export default class AiSdkController {
  @openapi({
    summary: "Function Calling",
    description:
      "Uses [@ai-sdk/openai](https://www.npmjs.com/package/@ai-sdk/openai) and ai packages to call a function",
  })
  @post("function-calling")
  static async functionCalling(req: VovkRequest<{ messages: CoreMessage[] }>) {
    const { messages } = await req.json();
    const LIMIT = 20;
    const { functions } = createLLMFunctions({
      modules: { UserController, TaskController },
      onSuccess: (d) => console.log("Success", d),
      onError: (e) => console.error("Error", e),
    });

    if (messages.filter(({ role }) => role === "user").length > LIMIT) {
      throw new HttpException(
        HttpStatus.BAD_REQUEST,
        `You can only send ${LIMIT} messages at a time`,
      );
    }

    const tools = Object.fromEntries(
      functions.map(({ name, execute, description, parameters }) => [
        name,
        tool<KnownAny, KnownAny>({
          execute: async (args, { toolCallId }) => {
            return execute(args, { toolCallId });
          },
          description,
          parameters: jsonSchema(parameters as KnownAny),
        }),
      ]),
    );

    return streamText({
      model: openai("gpt-4.1"),
      toolCallStreaming: true,
      maxSteps: 10,
      system: "You execute functions sequentially, one by one.",
      messages,
      tools,
      onError: (e) => console.error("streamText error", e),
      onFinish: ({ finishReason, toolCalls }) => {
        if (finishReason === "tool-calls") {
          console.log("Tool calls finished", toolCalls);
        }
      },
    }).toDataStreamResponse();
  }
}
