import { test } from "node:test";
import assert from "node:assert/strict";
import { ARCH_CHAPTERS, ARCH_MILESTONES, ARCH_PERIODS, ARCH_TERMS, ASSIGNMENT_TERMS, matchesArchTerm } from "../src/data/classical-architecture/index.ts";

const chapterIds = new Set(ARCH_CHAPTERS.map((c) => c.id));

test("every term on the assignment sheet has a glossary entry marked as an exam term", () => {
  const byId = new Map(ARCH_TERMS.map((t) => [t.id, t]));
  for (const id of ASSIGNMENT_TERMS) {
    assert.ok(byId.has(id), `missing assignment term ${id}`);
    assert.equal(byId.get(id).list, true, `${id} should be marked list: true`);
  }
});

test("terms are unique, well formed and short enough for the five-line answer", () => {
  const ids = new Set();
  for (const t of ARCH_TERMS) {
    assert.ok(!ids.has(t.id), `duplicate id ${t.id}`);
    ids.add(t.id);
    assert.ok(chapterIds.has(t.chapter), `${t.id}: unknown chapter ${t.chapter}`);
    assert.ok(t.term.trim() && t.text.trim(), `${t.id}: empty term or text`);
    assert.ok(t.text.length <= 420, `${t.id}: explanation is ${t.text.length} characters`);
    assert.equal(typeof t.lecture, "boolean");
  }
  for (const c of ARCH_CHAPTERS) assert.ok(ARCH_TERMS.some((t) => t.chapter === c.id), `chapter ${c.id} has no terms`);
});

test("milestones run in order and point at real periods and chapters", () => {
  const periods = new Set(ARCH_PERIODS.map((p) => p.id));
  ARCH_MILESTONES.forEach((m, i) => {
    assert.equal(m.id, `AR-${String(i + 1).padStart(2, "0")}`);
    assert.ok(periods.has(m.period), `${m.id}: period ${m.period}`);
    assert.ok(chapterIds.has(m.chapter), `${m.id}: chapter ${m.chapter}`);
    if (i) assert.ok(ARCH_MILESTONES[i - 1].year <= m.year, `${m.id}: year goes backwards`);
  });
});

test("search matches Hebrew, Latin and site names", () => {
  const find = (q) => ARCH_TERMS.filter((t) => matchesArchTerm(t, q)).map((t) => t.id);
  assert.ok(find("Hypocaustum").includes("hypocaust"));
  assert.ok(find("בית גוברין").includes("amphitheatre"));
  assert.ok(find("וולוטות").includes("ionic"));
  assert.equal(find("").length, ARCH_TERMS.length);
});
