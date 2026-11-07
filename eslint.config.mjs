import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // אפליקציה נפרדת (Cloudflare Worker + Vite) עם כלים משלה.
    "history-talk/**",
    "deploy/**",
    "api/**",
    // סקילים של סוכנים, כולל קוד חיצוני שמועתק כמו שהוא.
    ".claude/**",
    ".agents/**",
    // Prebuilt third-party bundles (games, timelines, the heritage map) — vendored, not our source.
    "public/embeds/**",
  ]),
]);

export default eslintConfig;
