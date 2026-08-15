import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/moreh-derech",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
