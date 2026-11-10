import test from "node:test";
import assert from "node:assert/strict";
import worker, { isPage, stripLegacy } from "../deploy/site/worker.ts";

test("legacy /moreh-derech paths are recognised and stripped", () => {
  assert.equal(stripLegacy("/moreh-derech"), "/");
  assert.equal(stripLegacy("/moreh-derech/"), "/");
  assert.equal(stripLegacy("/moreh-derech/quizzes/bronze-age/"), "/quizzes/bronze-age/");
  assert.equal(stripLegacy("/moreh-derech/images/x.webp"), "/images/x.webp");
  assert.equal(stripLegacy("/quizzes/"), null);
  assert.equal(stripLegacy("/moreh-derechX/a"), null);
});

test("pages redirect, files are served in place", async () => {
  assert.ok(isPage("/quizzes/"));
  assert.ok(isPage("/quizzes"));
  assert.ok(isPage("/index.html"));
  assert.ok(!isPage("/images/a.webp"));
  const seen = [];
  const env = { ASSETS: { fetch: async (req) => { seen.push(new URL(req.url).pathname); return new Response("asset"); } } };
  const page = await worker.fetch(new Request("https://moreyderech.com/moreh-derech/exams/?x=1"), env);
  assert.equal(page.status, 301);
  assert.equal(page.headers.get("location"), "https://moreyderech.com/exams/?x=1");
  const file = await worker.fetch(new Request("https://moreyderech.com/moreh-derech/images/roman-people/era-emblems.webp"), env);
  assert.equal(await file.text(), "asset");
  assert.deepEqual(seen, ["/images/roman-people/era-emblems.webp"]);
  await worker.fetch(new Request("https://moreyderech.com/quizzes/"), env);
  assert.equal(seen.at(-1), "/quizzes/");
});

test("lead notify: only the caller's unsent leads, one mail, then marked", async () => {
  const { handleLeadNotify, runDaily } = await import("../deploy/site/notify.ts");
  const env = {
    SUPABASE_URL: "https://sb", SUPABASE_ANON_KEY: "anon", SUPABASE_SERVICE_KEY: "svc", RESEND_API_KEY: "rk",
    OWNER_INBOX: "office@moreyderech.com", MAIL_FROM: "x <office@moreyderech.com>", SITE_ORIGIN: "https://moreyderech.com",
  };
  const calls = [];
  const lead = { id: 7, kind: "join", plan: "yearly", email: "a@b.c", full_name: "דנה <b>", phone: "050", note: "", created_at: "2026-11-10T10:00:00Z" };
  globalThis.fetch = async (url, init = {}) => {
    calls.push(`${init.method ?? "GET"} ${url}`);
    if (String(url).endsWith("/auth/v1/user")) return init.headers.Authorization === "Bearer good" ? Response.json({ id: "u1" }) : new Response("", { status: 401 });
    if (String(url).includes("/rest/v1/md_leads") && (init.method ?? "GET") === "GET") return Response.json(String(url).includes("user_id=eq.u1") ? [lead] : []);
    if (String(url).includes("/rpc/md_expiring")) return Response.json([{ user_id: "u2", email: "x@y.z", full_name: "יוסי", plan: "halfyear", current_period_end: "2026-12-10T00:00:00Z" }]);
    if (String(url).includes("resend")) { calls.push(JSON.parse(init.body).subject + " → " + JSON.parse(init.body).to[0]); return Response.json({ id: "m" }); }
    return new Response(null, { status: 204 });
  };
  const bad = await handleLeadNotify(new Request("https://moreyderech.com/api/lead-notify", { method: "POST", headers: { authorization: "Bearer nope" } }), env);
  assert.equal(bad.status, 401);
  const ok = await handleLeadNotify(new Request("https://moreyderech.com/api/lead-notify", { method: "POST", headers: { authorization: "Bearer good" } }), env);
  assert.equal(ok.status, 204);
  assert.ok(calls.some((c) => c.includes("בקשת הצטרפות") && c.endsWith("office@moreyderech.com")));
  assert.ok(calls.some((c) => c.startsWith("PATCH https://sb/rest/v1/md_leads?id=in.(7)")));
  calls.length = 0;
  const daily = await runDaily(env);
  assert.equal(daily.reminded, 1);
  assert.ok(calls.some((c) => c.includes("מסתיים בעוד חודש") && c.endsWith("x@y.z")));
  // without secrets nothing is sent
  calls.length = 0;
  assert.deepEqual(await runDaily({ ...env, RESEND_API_KEY: undefined }), { skipped: true, reminded: 0, leads: 0 });
  assert.equal(calls.length, 0);
});

test("mail text escapes user input", async () => {
  const { leadLine } = await import("../deploy/site/notify.ts");
  assert.ok(!leadLine({ id: 1, kind: "signup", plan: null, email: "<x>", full_name: "<script>", phone: "", note: "", created_at: "" }).includes("<script>"));
});
