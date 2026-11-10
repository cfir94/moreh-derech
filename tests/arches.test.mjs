// קשתות וקמרונות: העקומות סגורות על הפתח, והנתונים שלמים.
import test from "node:test";
import assert from "node:assert/strict";
import { ARCH_TYPES, PROFILES } from "../src/data/arches/arches.ts";
import { intrados, SPAN } from "../src/components/arches/profile.ts";

test("every curve springs from both piers and peaks in the middle", () => {
  for (const profile of ["round", "pointed", "horseshoe"]) {
    const pts = intrados(profile);
    const [a, b] = [pts[0], pts.at(-1)];
    assert.ok(Math.abs(a[0] + SPAN / 2) < 0.02 && Math.abs(b[0] - SPAN / 2) < 0.02, `${profile}: springs at the piers`);
    assert.ok(Math.abs(a[1]) < 0.02 && Math.abs(b[1]) < 0.02, `${profile}: on the springing line`);
    const top = pts.reduce((m, p) => (p[1] > m[1] ? p : m));
    assert.ok(Math.abs(top[0]) < 0.06, `${profile}: apex in the middle`);
  }
  // a pointed arch is taller than a round one on the same span; a horseshoe is wider than its opening
  const h = (p) => Math.max(...intrados(p).map((x) => x[1]));
  assert.ok(h("pointed") > h("round"));
  assert.ok(Math.max(...intrados("horseshoe").map((x) => Math.abs(x[0]))) > SPAN / 2 + 0.1);
});

test("arch types are complete and ordered data", () => {
  const ids = new Set();
  for (const t of ARCH_TYPES) {
    assert.ok(!ids.has(t.id), `duplicate ${t.id}`); ids.add(t.id);
    assert.ok(PROFILES[t.profile], t.id);
    assert.ok(t.sign && t.about && t.sites.length, t.id);
  }
});
