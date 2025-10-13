import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { headers } from "next/headers";

async function App() {
  const isIframe = (await headers()).get("sec-fetch-dest") === "iframe";
  return (
    <ApiReferenceReact
      configuration={{
        showSidebar: !isIframe,
        url: "/api/static/openapi.json",
        hideModels: true,
        servers: [
          {
            url: "http://localhost:3000",
            description: "Localhost",
          },
          {
            url: "https://vovk-hello-world.vercel.app",
            description: "Production",
          },
        ],
      }}
    />
  );
}

export default App;
