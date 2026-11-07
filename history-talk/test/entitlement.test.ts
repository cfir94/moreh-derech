import assert from "node:assert/strict";
import { test } from "node:test";
import { hasAccess, type Env } from "../src/worker/guards.ts";

const base = { SUPABASE_URL: "https://sb.example", SUPABASE_ANON_KEY: "anon" } as Partial<Env>;
const req = (token?: string) => new Request("https://w.example/api/token", { method: "POST", headers: token ? { "X-MD-Auth": token } : {} });

test("access check is off unless REQUIRE_ENTITLEMENT is 1", async () => {
  let called = false;
  const fetcher = (async () => { called = true; return Response.json(false); }) as typeof fetch;
  assert.equal(await hasAccess(req(), { ...base, REQUIRE_ENTITLEMENT: "0" } as Env, fetcher), true);
  assert.equal(await hasAccess(req(), { ...base } as Env, fetcher), true);
  assert.equal(called, false);
});

test("when enforced, asks md_has_access as the user and fails closed", async () => {
  const env = { ...base, REQUIRE_ENTITLEMENT: "1" } as Env;
  let seen: { url: string; auth: string | null } | undefined;
  const yes = (async (url: string, init: RequestInit) => {
    seen = { url, auth: new Headers(init.headers).get("Authorization") };
    return Response.json(true);
  }) as typeof fetch;
  assert.equal(await hasAccess(req("user-jwt"), env, yes), true);
  assert.deepEqual(seen, { url: "https://sb.example/rest/v1/rpc/md_has_access", auth: "Bearer user-jwt" });

  assert.equal(await hasAccess(req(), env, yes), false, "no token");
  assert.equal(await hasAccess(req("t"), env, (async () => Response.json(false)) as typeof fetch), false, "no access");
  assert.equal(await hasAccess(req("t"), env, (async () => new Response("expired", { status: 401 })) as typeof fetch), false, "expired token");
  assert.equal(await hasAccess(req("t"), env, (async () => { throw new Error("down"); }) as typeof fetch), false, "supabase down");
  assert.equal(await hasAccess(req("t"), { REQUIRE_ENTITLEMENT: "1" } as Env, yes), false, "not configured");
});
