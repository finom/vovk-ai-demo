import { initSegment, generateStaticAPI, get, operation } from "vovk";
import { openapi } from "vovk-client/openapi";

class OpenApiController {
  @operation({
    summary: "OpenAPI spec",
    description: "Get the OpenAPI spec for the app API",
  })
  @get("openapi.json")
  static getSpec = () => openapi;
}

const controllers = {
  OpenApiRPC: OpenApiController,
};

export type Controllers = typeof controllers;
export function generateStaticParams() {
  return generateStaticAPI(controllers);
}
export const { GET } = initSegment({
  segmentName: "static",
  emitSchema: true,
  controllers,
});
