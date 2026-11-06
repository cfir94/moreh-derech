import type { NextConfig } from "next";

// GitHub Pages מגיש את האתר תחת /moreh-derech. ב-Cloudflare (moreyderech.com) האתר יושב בשורש:
// הבנייה שם רצה עם NEXT_PUBLIC_BASE_PATH="" (ראו .github/workflows/deploy-cloudflare.yml ו-deploy/site/).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/moreh-derech";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
