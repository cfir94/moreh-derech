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
