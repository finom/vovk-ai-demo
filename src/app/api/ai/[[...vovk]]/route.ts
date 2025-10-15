import { initSegment } from "vovk";
import AiSdkController from "../../../../modules/ai/AiSdkController";

const controllers = {
  AiSdkRPC: AiSdkController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  segmentName: "ai",
  emitSchema: false,
  controllers,
});
