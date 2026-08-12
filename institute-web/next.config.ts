import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.NEXT_PUBLIC_BASE_PATH
    ? {
        basePath: process.env.NEXT_PUBLIC_BASE_PATH,
        assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH,
      }
    : {}),
  ...(process.env.NEXT_OUTPUT === "export"
    ? {
        output: "export" as const,
        images: {
          unoptimized: true,
        },
      }
    : {}),
  images: {
    ...(process.env.NEXT_OUTPUT === "export" ? { unoptimized: true } : {}),
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
