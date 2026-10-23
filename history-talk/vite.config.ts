import { resolve } from "node:path";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const here = import.meta.dirname;

// Worker אחד שמגיש גם את הקבצים הסטטיים: התוסף של Cloudflare בונה את הלקוח
// ל-dist/client ואת ה-Worker ל-dist/history_talk, ו-`wrangler deploy` מעלה את שניהם.
export default defineConfig({
  root: resolve(here, "web"),
  publicDir: resolve(here, "web/public"),
  plugins: [cloudflare({ configPath: resolve(here, "wrangler.jsonc") })],
  build: { outDir: resolve(here, "dist"), emptyOutDir: true },
  environments: {
    client: {
      build: {
        outDir: resolve(here, "dist/client"),
        emptyOutDir: true,
        rollupOptions: {
          input: {
            index: resolve(here, "web/index.html"),
            talk: resolve(here, "web/talk.html"),
          },
        },
      },
    },
  },
});
