import { prefix, get } from "vovk";
import { NextResponse } from "next/server";
import { z } from "zod";
import DBEventsService from "../database/DatabaseEventsService";
import { withZod } from "@/lib/withZod";

DBEventsService.emitter.on("db_updates", (change) => {
  console.log("Database change detected:", change);
});

@prefix("realtime")
export default class RealtimeController {
  @get("session")
  static session = withZod({
    query: z.object({
      voice: z.enum(["ash", "ballad", "coral", "sage", "verse"]),
    }),
    async handle(req) {
      try {
        if (!process.env.OPENAI_API_KEY) {
          throw new Error(`OPENAI_API_KEY is not set`);
        }
        const response = await fetch(
          "https://api.openai.com/v1/realtime/sessions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-realtime-mini",
              voice: req.vovk.query().voice,
              modalities: ["audio", "text"],
              instructions:
                "Speak and respond in the language of the user (например, по-русски). Start conversation with the user by saying 'Hello, how can I help you today?' Use the available tools when relevant. After executing a tool, you will need to respond (create a subsequent conversation item) to the user sharing the function result or error. If you do not respond with additional message with function result, user will not know you successfully executed the tool.",
              tool_choice: "auto",
            }),
          },
        );

        if (!response.ok) {
          throw new Error(
            `API request failed with status ${JSON.stringify(response)}`,
          );
        }

        const data = await response.json();

        // Return the JSON response to the client
        return NextResponse.json(data);
      } catch (error) {
        console.error("Error fetching session data:", error);
        return NextResponse.json(
          { error: "Failed to fetch session data" },
          { status: 500 },
        );
      }
    },
  });
}
