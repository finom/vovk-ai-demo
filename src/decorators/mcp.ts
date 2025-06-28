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
    const meta = req.vovk.meta<{ header: { isMCP?: true }; isMCP?: true }>();
    const isMCP = meta.isMCP ?? meta.header?.isMCP ?? false;
    const resp = await next();

    /*
    {
          content: [{ type: "text", text: `🎲 You rolled a ${value}!` }],
        };
        */

        console.log('isMCP', meta);

    if (isMCP) {
      return {
        content: [
          {
            type: "text",
            text:
              successMessage +
              (includeResponse ? `\n\nResponse: ${YAML.stringify(resp)}` : ""),
          },
        ],
      };
    }
    return resp;
  },
);

export default mcp;
