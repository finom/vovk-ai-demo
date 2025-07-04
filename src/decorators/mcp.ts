import { createDecorator } from "vovk";
import * as YAML from "yaml";

const mcp = createDecorator(
  async (
    req,
    next,
    {
      successMessage,
      includeResponse = true,
    }: { successMessage: string; includeResponse?: boolean },
  ) => {
    const data = await next();
    const meta = req.vovk.meta<{ clientMetaHeader: { isMCP?: true }; isMCP?: true }>();
    const isMCP = meta.isMCP ?? meta.clientMetaHeader?.isMCP ?? false;
    console.log("isMCP meta", meta);
    /*
    {
      content: [{ type: "text", text: `🎲 You rolled a ${value}!` }],
    };
    */

    if (isMCP) {
      return {
        content: [
          {
            type: "text",
            text:
              successMessage +
              (includeResponse ? `\n\nResponse:\n${YAML.stringify(data)}` : ""),
          },
        ],
      };
    }
    return data;
  },
);

export default mcp;
