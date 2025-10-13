// @ts-check
import _ from "lodash";
import "dotenv/config";

const { camelCase, startCase } = _;

/** @type {import('vovk').VovkConfig} */
const config = {
  generatorConfig: {
    origin: process.env.VERCEL
      ? `https://vovk-ai-demo.vercel.app`
      : "http://localhost:3000",
    imports: {
      validateOnClient: "vovk-ajv",
      fetcher: "./src/lib/fetcher.ts",
    },
    segments: {
      github: {
        openAPIMixin: {
          source: {
            url: "https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json",
            fallback: ".openapi-cache/github.json",
          },
          getModuleName: ({ operationObject }) => {
            const [operationNs] = operationObject.operationId?.split("/") ?? [
              "GithubRPC",
            ];
            return `Github${startCase(camelCase(operationNs)).replace(/ /g, "")}RPC`;
          },
          getMethodName: ({ operationObject }) => {
            const [, operationName] = operationObject.operationId?.split(
              "/",
            ) ?? ["", "ERROR"];
            return camelCase(operationName);
          },
        },
      },
      telegram: {
        openAPIMixin: {
          source: {
            url: "https://raw.githubusercontent.com/sys-001/telegram-bot-api-versions/refs/heads/main/files/openapi/yaml/v183.yaml",
            fallback: ".openapi-cache/telegram.yaml",
          },
          getModuleName: "TelegramRPC",
          getMethodName: ({ path }) => path.replace(/^\//, ""),
          errorMessageKey: "description",
        },
      },
    },
  },
  moduleTemplates: {
    service: "vovk-cli/module-templates/Service.ts.ejs",
    controller: "vovk-zod/module-templates/Controller.ts.ejs",
  },
  libs: {
    ajv: {
      target: "draft-07",
    },
  },
};

export default config;
