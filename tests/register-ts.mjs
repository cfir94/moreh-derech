import { registerHooks, stripTypeScriptTypes } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/")) {
      const path = resolve(root, "src", specifier.slice(2));
      if (specifier === "@/lib/cloudAuth") return { url: pathToFileURL(path + ".ts").href, shortCircuit: true };
      return next(pathToFileURL(existsSync(path + ".ts") ? path + ".ts" : path + "/index.ts").href, context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith("/src/lib/cloudAuth.ts")) return { format: "module", shortCircuit: true, source:
      'export const AUTH_EVENT="auth-changed"; export const readSession=()=>globalThis.__testSession; export const supabaseRequest=(...args)=>globalThis.__testSupabase(...args); export const authenticatedSupabaseRequest=supabaseRequest;' };
    if (url.endsWith(".ts")) return { format: "module", shortCircuit: true,
      source: stripTypeScriptTypes(readFileSync(new URL(url), "utf8")) };
    return next(url, context);
  },
});
