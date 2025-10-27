import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    outputFileTracingIncludes: {
        '/*': ['./node_modules/.prisma/client/*.wasm']
    },
};

export default nextConfig;
