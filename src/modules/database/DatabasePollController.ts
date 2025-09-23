import { EntityType } from "@prisma/client";
import { get, JSONLinesResponse, prefix, VovkIteration } from "vovk";
import { z } from "zod";
import DatabasePollService from "./DatabasePollService";
import { TaskSchema, UserSchema } from "../../../prisma/generated/schemas";
import { withZod } from "@/lib/withZod";

@prefix("poll")
export default class DatabasePollController {
  @get()
  static poll = withZod({
    iteration: z.union([
      z.object({
        id: z.uuid(),
        entityType: z.enum(EntityType),
        __isDeleted: z.boolean().optional(),
      }),
      UserSchema,
      TaskSchema,
    ]),
    async handle(req) {
      const response = new JSONLinesResponse<
        VovkIteration<typeof DatabasePollController.poll>
      >(req);

      void DatabasePollService.poll(response);

      return response;
    },
  });
}
