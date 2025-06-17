import { initVovk } from "vovk";
import UserController from "../../../modules/user/UserController";
import TaskController from "../../../modules/task/TaskController";

export const runtime = "nodejs";

const controllers = {
  UserRPC: UserController,
  TaskRPC: TaskController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initVovk({
  emitSchema: true,
  controllers,
});
