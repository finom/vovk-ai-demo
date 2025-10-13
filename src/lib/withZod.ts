import { z } from "zod";
import { createStandardValidation } from "vovk";

export const withZod = createStandardValidation({
  toJSONSchema: (model: z.core.$ZodType) =>
    z.toJSONSchema(model, { target: "draft-7" }),
});
