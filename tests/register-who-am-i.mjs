import "./register-ts.mjs";
import { registerHooks } from "node:module";
import { readFileSync } from "node:fs";
registerHooks({
  load(url, context, next) {
    if (url.endsWith(".json")) return { format: "module", shortCircuit: true, source: "export default " + readFileSync(new URL(url), "utf8") };
    return next(url, context);
  },
});
