import AiSdkController from "@/modules/ai/ai-sdk/AiSdkController";
import { initVovk } from "vovk";

export const runtime = "edge";

const controllers = {
    AiSdkRPC: AiSdkController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initVovk({
  segmentName: "ai",
  emitSchema: false,
  controllers,
});
