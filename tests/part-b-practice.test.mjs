import test from "node:test";
import assert from "node:assert/strict";
import { EXAM_PAPERS, OFFICIAL_PAPERS } from "../src/data/guide-reports/exam-briefs.ts";
import { PRACTICE_PAPERS } from "../src/data/guide-reports/practice-papers.ts";
import { GROUP_INSIGHTS } from "../src/data/guide-reports/group-insights.ts";
import { DRILLS } from "../src/data/guide-reports/part-b-drills.ts";
import { ALL_EMPHASES } from "../src/data/guide-reports/coordinator-session.ts";
import { schedule, driveMinutes, parseClock } from "../src/lib/partBWorkshop.ts";

const is2026 = (p) => p.groups.length === 4 && p.groups.every((g) => g.shortUnits.length === 5);

test("official papers stay first, practice papers are marked and in 2026 shape", () => {
  assert.equal(EXAM_PAPERS[0].slug, OFFICIAL_PAPERS[0].slug);
  assert.ok(OFFICIAL_PAPERS.every((p) => !p.practice));
  assert.equal(new Set(EXAM_PAPERS.map((p) => p.slug)).size, EXAM_PAPERS.length);
  for (const p of PRACTICE_PAPERS) {
    assert.ok(p.practice, p.slug);
    assert.ok(is2026(p), p.slug);
    assert.ok(p.note, p.slug);
    for (const g of p.groups) {
      assert.equal(g.start.split(", ")[1], "08:00", `${p.slug}:${g.n}`);
      assert.equal(g.end.split(", ")[1], "18:00", `${p.slug}:${g.n}`);
    }
  }
});

test("every 2026-format group has a full insight whose keywords are in the brief", () => {
  const groups = EXAM_PAPERS.filter(is2026).flatMap((p) => p.groups.map((g) => [`${p.slug}:${g.n}`, g]));
  assert.ok(groups.length >= 16);
  for (const [key, g] of groups) {
    const ins = GROUP_INSIGHTS[key];
    assert.ok(ins, key);
    assert.equal(ins.candidates.length, g.shortUnits.length, key);
    ins.candidates.forEach((c, i) => assert.ok(c.length >= 2, `${key} slot ${i}`));
    assert.ok(ins.extended.length >= 2, key);
    assert.ok(ins.keywords.length >= 2, key);
    for (const k of ins.keywords) assert.ok(g.brief.includes(k.word), `${key}: "${k.word}" not in brief`);
  }
  assert.deepEqual(Object.keys(GROUP_INSIGHTS).sort(), groups.map(([k]) => k).sort());
});

test("drills: one answer, spread positions, no length giveaway, known emphasis", () => {
  const ids = new Set(ALL_EMPHASES.map((e) => e.id));
  const pos = [0, 0, 0, 0];
  let longest = 0;
  for (const d of DRILLS) {
    assert.equal(d.options.length, 4, d.id);
    assert.equal(new Set(d.options).size, 4, d.id);
    assert.ok(ids.has(d.emphasis), `${d.id}: ${d.emphasis}`);
    pos[d.correct]++;
    const lens = d.options.map((o) => o.length);
    const others = lens.filter((_, i) => i !== d.correct);
    if (lens[d.correct] > Math.max(...others)) longest++;
  }
  assert.equal(new Set(DRILLS.map((d) => d.id)).size, DRILLS.length);
  for (const n of pos) assert.ok(n >= DRILLS.length / 4 - 2, `positions ${pos}`);
  assert.ok(longest / DRILLS.length <= 0.25, `correct answer longest in ${longest}/${DRILLS.length}`);
});

test("schedule arithmetic", () => {
  const stops = [
    { id: "a", kind: "unit", slot: 0, minutes: 45, driveBefore: 10 },
    { id: "l", kind: "lunch", minutes: 60, driveBefore: 20 },
  ];
  const s = schedule(stops, parseClock("לטרון, 08:00"), 30);
  assert.equal(s.timed[0].arrive, 8 * 60 + 10);
  assert.equal(s.timed[1].arrive, 9 * 60 + 15);
  assert.equal(s.end, 10 * 60 + 45);
  assert.equal(s.totalDrive, 60);
  assert.equal(driveMinutes(40), 35);
  assert.equal(driveMinutes(0), 0);
});
