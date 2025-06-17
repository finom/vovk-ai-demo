import { initVovk } from "vovk";
import AiSdkController from "@/modules/ai/AiSdkController";

export const runtime = "edge";

const controllers = {
  AiSdkRPC: AiSdkController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initVovk({
  emitSchema: false,
  controllers,
});
