import { initVovk } from "vovk";
import UserController from "../../../modules/user/UserController";
import AiSdkController from "@/modules/llm/AiSdkController";
import TaskController from "../../../modules/task/TaskController";

export const runtime = "edge";

const controllers = {
  UserRPC: UserController,
  AiSdkRPC: AiSdkController,
  TaskRPC: TaskController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initVovk({
  emitSchema: true,
  controllers,
});
