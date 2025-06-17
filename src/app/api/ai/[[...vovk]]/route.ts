import AiSdkController from "@/modules/ai/ai-sdk/AiSdkController";
import { initVovk } from "vovk";

export const runtime = "nodejs"; // to fix the 1MB limitation for an edge function in free plan
export const maxDuration = 60;

const controllers = {
    AiSdkRPC: AiSdkController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initVovk({
  segmentName: "ai",
  emitSchema: false, // the RPC is never used on front-end
  controllers,
});
