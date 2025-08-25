import { EntityType } from "@prisma/client";
import { get, JSONLinesResponse, prefix, VovkIteration } from "vovk";
import { withZod } from "vovk-zod/v3";
import { z } from "zod/v3";
import DatabasePollService from "./DatabasePollService";
import { TaskModel, UserModel } from "@/zod";

@prefix("poll")
export default class DatabasePollController {
  @get()
  static poll = withZod({
    iteration: z.union([
      z.object({
        id: z.string().uuid(),
        entityType: z.nativeEnum(EntityType),
        __isDeleted: z.boolean().optional(),
      }),
      UserModel,
      TaskModel,
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
