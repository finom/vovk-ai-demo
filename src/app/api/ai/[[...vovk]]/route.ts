import { initSegment } from "vovk";
import AiSdkController from "@/modules/ai/AiSdkController";

export const runtime = "nodejs";

export const maxDuration = 60;

const controllers = {
  AiSdkRPC: AiSdkController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  emitSchema: false,
  controllers,
});
