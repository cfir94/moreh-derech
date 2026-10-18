import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { EXAMS } from "../src/data/exams/index.ts";
import courseBank from "../src/data/quizzes/course-bank.ts";
import pastExams from "../src/data/quizzes/past-exams.ts";
import { parseProgress, recordAttempt, readProgress, needsReview, correctAttemptAnswer, progressStorageKey } from "../src/lib/progress.ts";
import { reviewQuestions } from "../src/lib/reviewQuestions.ts";
import { saveDraft, getDraft, readDrafts, draftKind, draftHref, validDraftPayload } from "../src/lib/guideReportDrafts.ts";
import { createRequestCache } from "../src/lib/requestCache.ts";
import { createStoredNotebook, updateStoredNotebook, deleteStoredNotebook, notebookRevision } from "../src/lib/notebookStore.ts";
import { matchesAnswer } from "../src/lib/answerMatching.ts";

class Storage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}
beforeEach(() => {
  globalThis.window = new EventTarget();
  window.localStorage = new Storage();
  globalThis.__testSession = undefined;
});

const stat = (quiz, questionId, overrides = {}) => ({
  quiz, questionId, question: "test", category: "test", seen: 2, wrong: 1,
  lastCorrectAt: 10, lastWrongAt: 20, ...overrides,
});
const answer = (questionId, correct, quiz = "past-exams") => ({ questionId, question: "test", category: "test", correct, quiz });
const record = (answers) => recordAttempt({ quiz: "past-exams", quizLabel: "test", category: "test", answers });

test("every exam MC and fill item can enter review with its original ID", () => {
  const questions = {};
  for (const exam of EXAMS) {
    for (const q of exam.questions) {
      assert.equal(q.quizId > 20000, exam.keySource === "course", "ID namespace changed: update migration before importing");
      questions["past-exams:" + q.quizId] = stat("past-exams", q.quizId);
    }
  }
  const state = parseProgress(JSON.stringify({ attempts: [], questions }));
  const review = reviewQuestions(state, [courseBank, pastExams], EXAMS);
  assert.equal(review.unavailable, 0);
  assert.equal(review.questions.length, Object.keys(questions).length);
  assert.equal(review.questions.filter(q => q.kind === "fill").length, 277);
  assert.equal(review.questions.find(q => q.id === 20001).sourceQuiz, "course-bank");
  assert.equal(review.questions.find(q => q.id === 12001).kind, "fill");
  for (const q of review.questions) assert.equal(q.kind === "fill" ? !!q.answerText : q.answers.length === 4, true);
});

test("legacy owner repair preserves and merges all counters and is idempotent", () => {
  const raw = { attempts: [{ ts: 1, quiz: "past-exams", quizLabel: "old", category: "מבחן מלא — מבחן תרגול 1", total: 24, correct: 10 }],
    questions: { "past-exams:20001": stat("past-exams", 20001), "course-bank:20001": stat("course-bank", 20001, { seen: 3, wrong: 2, lastCorrectAt: 30 }) } };
  const state = parseProgress(JSON.stringify(raw));
  assert.equal(state.questions["past-exams:20001"], undefined);
  assert.equal(state.questions["course-bank:20001"].seen, 5);
  assert.equal(state.questions["course-bank:20001"].wrong, 3);
  assert.equal(needsReview(state).length, 0);
  assert.equal(state.attempts[0].quiz, "course-bank");
  assert.deepEqual(parseProgress(JSON.stringify(state)), state);
});

test("correcting an exam answer changes the same attempt, not seen or attempt count", () => {
  const id = record([answer(12001, false)]);
  correctAttemptAnswer(id, 12001, true);
  let state = readProgress();
  assert.equal(state.attempts.length, 1);
  assert.equal(state.attempts[0].correct, 1);
  assert.equal(state.questions["past-exams:12001"].seen, 1);
  assert.equal(state.questions["past-exams:12001"].wrong, 0);
  assert.equal(needsReview(state).length, 0);
  correctAttemptAnswer(id, 12001, false);
  state = readProgress();
  assert.equal(state.attempts.length, 1);
  assert.equal(state.attempts[0].correct, 0);
  assert.equal(state.questions["past-exams:12001"].wrong, 1);
  assert.equal(needsReview(state).length, 1);
});

test("correction preserves earlier history and a later review outcome", () => {
  window.localStorage.setItem(progressStorageKey(), JSON.stringify({ attempts: [], questions: { "past-exams:12001": stat("past-exams", 12001) } }));
  const id = record([answer(12001, false)]);
  record([answer(12001, true)]);
  correctAttemptAnswer(id, 12001, true);
  let state = readProgress();
  assert.equal(state.questions["past-exams:12001"].seen, 4);
  assert.equal(state.questions["past-exams:12001"].wrong, 1);
  assert.equal(state.questions["past-exams:12001"].lastWrongAt, 20);
  assert.equal(needsReview(state).length, 0);
  correctAttemptAnswer(id, 12001, false);
  state = readProgress();
  assert.equal(state.questions["past-exams:12001"].wrong, 2);
  assert.equal(needsReview(state).length, 0);
});

test("guest and two signed-in users keep independent progress and corrections", () => {
  const guest = record([answer(12001, false)]);
  globalThis.__testSession = { user_id: "one" };
  const one = record([answer(12001, false)]);
  globalThis.__testSession = { user_id: "two" };
  correctAttemptAnswer(one, 12001, true);
  assert.equal(readProgress().attempts.length, 0);
  record([answer(20001, true, "course-bank")]);
  globalThis.__testSession = { user_id: "one" };
  assert.equal(needsReview(readProgress()).length, 1);
  correctAttemptAnswer(one, 12001, true);
  assert.equal(needsReview(readProgress()).length, 0);
  globalThis.__testSession = undefined;
  correctAttemptAnswer(guest, 12001, true);
  assert.equal(readProgress().attempts.length, 1);
});

test("day, unit and old/new exam drafts round-trip and update the same record", () => {
  const row = { time: "09:00", activity: "תוכן שנשמר", logistics: "מים" };
  const cases = [
    { kind: "day", payload: { scenarioId: "families-dead-sea", rows: [{ n: 1, ...row }] } },
    { kind: "unit", payload: { promptId: "sodom-fish-trail", site: "הר סדום", duration: "20", methods: "מפה", body: "טקסט לשחזור" } },
    { kind: "exam", payload: { paperSlug: "july-2026", groupN: 1, assumptions: "הנחות", rows: [row], units: [], expanded: { site: "", topic: "", position: "", body: "תוכן" } } },
  ];
  for (const input of cases) {
    const first = saveDraft({ ...input, title: "test" });
    assert.deepEqual(getDraft(first.id).payload, input.payload);
    assert.equal(validDraftPayload(first), true);
    assert.ok(draftHref(first).includes("?draft=" + first.id));
    const count = readDrafts().length;
    const updated = saveDraft({ ...input, id: first.id, title: "changed" });
    assert.equal(updated.createdAt, first.createdAt);
    assert.equal(readDrafts().length, count);
    assert.equal(getDraft(first.id).title, "changed");
  }
  const legacy = saveDraft({ kind: "day", title: "old exam", payload: cases[2].payload });
  assert.equal(draftKind(legacy), "exam");
  assert.ok(draftHref(legacy).startsWith("/guide-reports/exam?"));
  assert.equal(validDraftPayload({ ...legacy, payload: { paperSlug: "missing" } }), false);
  globalThis.__testSession = { user_id: "one" };
  assert.equal(getDraft(legacy.id), undefined);
  globalThis.__testSession = undefined;
  assert.equal(getDraft(legacy.id).kind, "day");
});

test("cache refreshes on create/edit/delete and retries failed reads", async () => {
  let list = [];
  let loads = 0;
  const cache = createRequestCache(async () => { loads++; return structuredClone(list); }, 60_000);
  assert.deepEqual(await cache.get(notebookRevision()), []);
  await cache.get(notebookRevision());
  assert.equal(loads, 1);
  globalThis.__testSession = { user_id: "one" };
  globalThis.__testSupabase = async (_path, args) => {
    if (args.method === "POST") { list = [{ id: 1, title: "new" }]; return list; }
    if (args.method === "PATCH") { list = [{ id: 1, title: "edited" }]; return list; }
    list = [];
  };
  await createStoredNotebook({});
  assert.equal((await cache.get(notebookRevision()))[0].title, "new");
  await updateStoredNotebook(1, {});
  assert.equal((await cache.get(notebookRevision()))[0].title, "edited");
  await deleteStoredNotebook(1);
  assert.deepEqual(await cache.get(notebookRevision()), []);
  let failures = 0;
  const retry = createRequestCache(async () => { if (++failures === 1) throw Error("offline"); return ["online"]; }, 60_000);
  await assert.rejects(retry.get(0));
  assert.deepEqual(await retry.get(0), ["online"]);
});

test("stale in-flight reads cannot replace a newer revision; TTL expires", async () => {
  let finish;
  let calls = 0;
  const cache = createRequestCache(() => ++calls === 1 ? new Promise(resolve => { finish = resolve; }) : Promise.resolve("new"), 0);
  const old = cache.get(0);
  assert.equal(await cache.get(1), "new");
  finish("old");
  assert.equal(await old, "old");
  assert.equal(await cache.get(1), "new");
  assert.equal(calls, 3);
});

test("fill matching accepts variants, punctuation and articles but not blanks", () => {
  assert.equal(matchesAnswer("דולמנים", "מגליתים / דולמנים"), true);
  assert.equal(matchesAnswer("הכתב!", "כתב / אלפבית"), true);
  assert.equal(matchesAnswer(" ", "כתב"), false);
  assert.equal(matchesAnswer("אלפא", "אלפבית"), false);
});
