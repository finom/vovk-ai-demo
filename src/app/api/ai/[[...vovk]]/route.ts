import { initVovk } from "vovk";
import AiSdkController from "@/modules/ai/AiSdkController";

export const runtime = "edge";

export const maxDuration = 60;

const controllers = {
  AiSdkRPC: AiSdkController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initVovk({
  emitSchema: false,
  controllers,
});
