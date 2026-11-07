import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { canonical, mergeDocs, parseDoc, withDeletions } from "../src/lib/sync/merge.ts";
import { SYNC_STORES, PROGRESS_STORE, DRAFTS_STORE } from "../src/lib/sync/stores.ts";
import { requestSync } from "../src/lib/sync/cloudSync.ts";
import { CloudAuthError as StubError } from "@/lib/cloudAuth";
globalThis.__CloudAuthError = StubError;
import { recordAttempt, readProgress, needsReview, resetProgress, correctAttemptAnswer } from "../src/lib/progress.ts";
import { saveDraft, readDrafts, deleteDraft } from "../src/lib/guideReportDrafts.ts";

class Storage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

const USER = "11111111-1111-4111-8111-111111111111";
class CloudAuthError extends Error {}

function device() {
  const target = new EventTarget();
  target.localStorage = new Storage();
  return target;
}
const use = (d) => { globalThis.window = d; globalThis.__testSession = { user_id: USER }; };

function fail(status, message) {
  const error = new (globalThis.__CloudAuthError ?? CloudAuthError)(message);
  error.status = status;
  throw error;
}

/** שרת PostgREST מדומה: שורה לכל (משתמש, מאגר), עם rev ו-RLS לפי המשתמש. */
function fakeServer() {
  const rows = new Map();
  const server = { rows, requests: 0, beforePatch: null };
  globalThis.__testSupabase = async (path, init = {}) => {
    server.requests++;
    const u = new URL(path, "https://x.supabase.co");
    assert.equal(u.pathname, "/rest/v1/md_user_data");
    const q = Object.fromEntries(u.searchParams);
    const method = init.method ?? "GET";
    if (method === "GET") {
      assert.equal(q.user_id, `eq.${USER}`);
      const names = q.store.replace(/^in\.\(|\)$/g, "").split(",");
      return names.filter((n) => rows.has(n)).map((n) => ({ store: n, ...structuredClone(rows.get(n)) }));
    }
    const body = structuredClone(init.body);
    if (method === "POST") {
      assert.equal(body.user_id, USER);
      if (rows.has(body.store)) fail(409, "duplicate key");
      rows.set(body.store, { data: body.data, rev: body.rev });
      return null;
    }
    if (method === "PATCH") {
      assert.equal(q.user_id, `eq.${USER}`);
      const store = q.store.replace(/^eq\./, "");
      if (server.beforePatch) { const hook = server.beforePatch; server.beforePatch = null; hook(store); }
      const row = rows.get(store);
      if (!row || `eq.${row.rev}` !== q.rev) return [];
      rows.set(store, { data: body.data, rev: body.rev });
      return [{ rev: body.rev }];
    }
    throw new Error("unexpected " + method);
  };
  return server;
}

const answer = (questionId, correct) => ({ questionId, question: "q" + questionId, category: "c", correct });
const record = (answers) => recordAttempt({ quiz: "prehistory", quizLabel: "פרהיסטוריה", category: "הכל", answers });
const reviewIds = () => needsReview(readProgress()).map((s) => s.questionId).sort();

beforeEach(() => {
  use(device());
});

test("merge is commutative, associative and idempotent for every store", () => {
  const docs = [
    PROGRESS_STORE.toDoc(JSON.stringify({
      attempts: [{ id: "a1", ts: 5, quiz: "x", quizLabel: "x", category: "c", correct: 1, total: 2 }],
      questions: { "x:1": { quiz: "x", questionId: 1, question: "", category: "", seen: 1, wrong: 1, lastCorrectAt: null, lastWrongAt: 5 } },
    })),
    PROGRESS_STORE.toDoc(JSON.stringify({
      attempts: [{ id: "a1", ts: 5, editedAt: 9, quiz: "x", quizLabel: "x", category: "c", correct: 2, total: 2 }],
      questions: { "x:1": { quiz: "x", questionId: 1, question: "", category: "", seen: 1, wrong: 0, lastCorrectAt: 5, lastWrongAt: null, rev: 9 } },
    })),
    { ...PROGRESS_STORE.toDoc(JSON.stringify({ attempts: [], questions: {} })), resetAt: 3 },
  ];
  const m = (a, b) => mergeDocs(a, b, PROGRESS_STORE.timeOf);
  const [a, b, c] = docs;
  assert.equal(canonical(m(a, b)), canonical(m(b, a)));
  assert.equal(canonical(m(m(a, b), c)), canonical(m(a, m(b, c))));
  assert.equal(canonical(m(m(a, b), b)), canonical(m(a, b)));
  // the edited attempt and the newer question row win
  const merged = JSON.parse(PROGRESS_STORE.fromDoc(m(a, b)));
  assert.equal(merged.attempts[0].correct, 2);
  assert.equal(merged.questions["x:1"].wrong, 0);
});

test("a deletion on one device survives a merge, a later edit brings the item back", () => {
  const local = { items: {}, gone: {} };
  const withGone = withDeletions(local, ["d1"], 100);
  assert.deepEqual(withGone.gone, { d1: 100 });
  const remote = parseDoc({ collections: { drafts: { items: { d1: { id: "d1", updatedAt: 50 } }, gone: {} } } });
  const doc = { v: 1, resetAt: 0, collections: { drafts: withGone } };
  assert.deepEqual(mergeDocs(remote, doc, DRAFTS_STORE.timeOf).collections.drafts.items, {});
  const edited = parseDoc({ collections: { drafts: { items: { d1: { id: "d1", updatedAt: 150 } }, gone: {} } } });
  assert.ok(mergeDocs(edited, doc, DRAFTS_STORE.timeOf).collections.drafts.items.d1);
});

test("every store round-trips its local format unchanged", () => {
  const samples = {
    progress: { attempts: [{ id: "a", ts: 1, quiz: "q", quizLabel: "q", category: "c", correct: 0, total: 1 }], questions: {} },
    "learning-map": { herodium: { seen: 1, wrong: 0, last: "correct", at: 4 } },
    crossword: { "2026-11-01": { sig: "s", fill: { "0,0": "א" }, revealed: [], checks: 0, ms: 10, startedAt: 2, savedAt: 3 } },
    "guide-drafts": [{ id: "d", kind: "unit", title: "t", payload: {}, createdAt: 1, updatedAt: 2 }],
  };
  for (const store of SYNC_STORES) {
    const raw = JSON.stringify(samples[store.name]);
    assert.equal(canonical(JSON.parse(store.fromDoc(store.toDoc(raw)))), canonical(samples[store.name]), store.name);
  }
});

test("two devices end up with the same mistakes, drafts and reset", async () => {
  const server = fakeServer();
  const phone = device();
  const laptop = device();

  // laptop: progress from before the sync existed, then a wrong answer
  use(laptop);
  laptop.localStorage.setItem(`md_progress_v2:${USER}`, JSON.stringify({
    attempts: [{ ts: 1000, quiz: "prehistory", quizLabel: "פ", category: "הכל", correct: 0, total: 1 }],
    questions: { "prehistory:7": { quiz: "prehistory", questionId: 7, question: "q7", category: "c", seen: 1, wrong: 1, lastCorrectAt: null, lastWrongAt: 1000 } },
  }));
  record([answer(1, false)]);
  await requestSync();
  assert.ok(server.rows.has("progress"));

  // phone: its own mistake, then sync — it gets the laptop's too
  use(phone);
  record([answer(2, false)]);
  await requestSync();
  assert.deepEqual(reviewIds(), [1, 2, 7]);

  use(laptop);
  await requestSync();
  assert.deepEqual(reviewIds(), [1, 2, 7]);

  // phone answers 1 correctly; the laptop's review queue clears it
  use(phone);
  record([answer(1, true)]);
  await requestSync();
  use(laptop);
  await requestSync();
  assert.deepEqual(reviewIds(), [2, 7]);

  // a self-check correction on the laptop reaches the phone
  const id = record([answer(2, false)]);
  correctAttemptAnswer(id, 2, true);
  await requestSync();
  use(phone);
  await requestSync();
  assert.deepEqual(reviewIds(), [7]);

  // a draft saved on the phone, deleted on the laptop, stays deleted
  const draft = saveDraft({ kind: "unit", title: "קיסריה", payload: { promptId: "p", site: "s", duration: "", methods: "", body: "" } });
  await requestSync();
  use(laptop);
  await requestSync();
  assert.deepEqual(readDrafts().map((d) => d.id), [draft.id]);
  deleteDraft(draft.id);
  await requestSync();
  use(phone);
  await requestSync();
  assert.deepEqual(readDrafts(), []);

  // reset on the phone empties the laptop too
  resetProgress();
  await requestSync();
  use(laptop);
  await requestSync();
  assert.deepEqual(readProgress().attempts, []);
  assert.deepEqual(reviewIds(), []);

  // nothing changed: a sync only reads
  const before = server.requests;
  await requestSync();
  assert.equal(server.requests - before, 1);
});

test("a write from another device between read and upload is merged, not lost", async () => {
  const server = fakeServer();
  const phone = device();
  use(phone);
  record([answer(1, false)]);
  await requestSync();

  const laptop = device();
  use(laptop);
  await requestSync();
  record([answer(2, false)]);
  // while the laptop uploads, the phone's newer mistake lands on the server
  server.beforePatch = (store) => {
    if (store !== "progress") return;
    const row = server.rows.get("progress");
    const doc = structuredClone(row.data);
    doc.collections.questions.items["prehistory:3"] = {
      quiz: "prehistory", questionId: 3, question: "q3", category: "c", seen: 1, wrong: 1,
      lastCorrectAt: null, lastWrongAt: Date.now() + 5, rev: Date.now() + 5,
    };
    server.rows.set("progress", { data: doc, rev: row.rev + 1 });
  };
  await requestSync();
  assert.deepEqual(reviewIds(), [1, 2, 3]);
  const stored = JSON.parse(PROGRESS_STORE.fromDoc(parseDoc(server.rows.get("progress").data)));
  assert.deepEqual(Object.keys(stored.questions).sort(), ["prehistory:1", "prehistory:2", "prehistory:3"]);
});

test("guests and a missing table never throw", async () => {
  globalThis.__testSession = undefined;
  let called = false;
  globalThis.__testSupabase = async () => { called = true; return []; };
  await requestSync();
  assert.equal(called, false);

  use(device());
  globalThis.__testSupabase = async () => fail(404, "Could not find the table 'public.md_user_data' in the schema cache");
  record([answer(1, false)]);
  await requestSync();
  assert.deepEqual(reviewIds(), [1]);
});
