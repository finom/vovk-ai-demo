<p align="center">
  <a href="https://vovk.dev">
    <picture>
      <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
      <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
      <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
    </picture>
  </a>
  <br>
  <strong>Back-end for <a href="https://nextjs.org/">Next.js</a></strong>
</p>

---

## vovk-ai-demo

A proof of concept app, demonstrating utilization of [controllers](https://vovk.dev/controller) and RPC modules as AI tools, that work on server-side (with [AI SDK](https://npmjs.com/package/@ai-sdk/react)), client-side (with [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)) and as MCP server (using [MCP Handler](https://npmjs.com/package/mcp-handler)).

The project and its idea explained in the series of articles at [Vovk.ts documentation](https://vovk.dev/):

- [LLM text chat completions](https://vovk.dev/llm) - describes LLM chat completions served as [JSONLines](https://vovk.dev/controller/jsonlines) response or [AI SDK](https://npmjs.com/package/@ai-sdk/react).

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Clone the repository:

```bash
git clone https://github.com/finom/vovk-ai-demo.git
cd vovk-ai-demo
```

Install the dependencies:

```bash
yarn
```

Create a `.env` file in the root directory and add your OpenAI API key and database connection strings:

```env filename=".env"
OPENAI_API_KEY=change_me
DATABASE_URL="postgresql://postgres:password@localhost:5432/vovk-ai-demo-db?schema=public"
DATABASE_URL_UNPOOLED="postgresql://postgres:password@localhost:5432/vovk-ai-demo-db?schema=public"
REDIS_URL=redis://localhost:6379
```

Run docker containers and development server

```bash
docker-compose up -d && yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

0------0------------------------------------------------0------0

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
