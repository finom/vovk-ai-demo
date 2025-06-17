// @ts-check
// import _ from 'lodash';
import "dotenv/config";

// const { camelCase, startCase } = _;

/** @type {import('vovk').VovkConfig} */
const config = {
  origin: process.env.VERCEL_ENV
    ? `https://vovk-ai-demo.vercel.app`
    : "http://localhost:3000",
  imports: {
    validateOnClient: "vovk-ajv",
    createRPC: "vovk-react-query",
    fetcher: "./src/lib/fetcher.ts",
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
  /* extendClientWithOpenAPI: {
    rootModules: [{
      source: { url: 'https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json' },
      getModuleName: ({ operationObject }) => {
        const [operationNs] = operationObject.operationId?.split('/') ?? ['GithubRPC'];
        return `Github${startCase(camelCase(operationNs)).replace(/ /g, '')}RPC`;
      }
      ,
      getMethodName: ({ operationObject }) => {
        const [, operationName] = operationObject.operationId?.split('/') ?? ['', 'ERROR'];
        return camelCase(operationName);
      },
    }],
  } */
};

export default config;
