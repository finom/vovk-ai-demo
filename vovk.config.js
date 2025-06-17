// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
  origin:process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000',
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
};
module.exports = config;
