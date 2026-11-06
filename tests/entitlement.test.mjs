import test from "node:test";
import assert from "node:assert/strict";
import { accessFrom, hasAccess } from "../src/lib/entitlement.ts";

const now = Date.parse("2026-11-10T12:00:00Z");
const day = 86_400_000;
const row = (over) => ({ user_id: "u", plan: "trial", status: "active", trial_ends_at: null, current_period_end: null, cancel_at_period_end: false, ...over });

test("guest and signed-in without a row", () => {
  assert.deepEqual(accessFrom(null, false, now), { kind: "guest" });
  assert.deepEqual(accessFrom(null, true, now), { kind: "none" });
});

test("trial counts days and expires", () => {
  const a = accessFrom(row({ trial_ends_at: new Date(now + 2.5 * day).toISOString() }), true, now);
  assert.equal(a.kind, "trial");
  assert.equal(a.daysLeft, 3);
  assert.ok(hasAccess(a));
  const b = accessFrom(row({ trial_ends_at: new Date(now - 1000).toISOString() }), true, now);
  assert.equal(b.kind, "expired");
  assert.ok(!hasAccess(b));
});

test("paid plans: active, canceling until period end, then expired", () => {
  const until = new Date(now + 20 * day).toISOString();
  assert.equal(accessFrom(row({ plan: "monthly", current_period_end: until }), true, now).kind, "paid");
  const canceling = accessFrom(row({ plan: "monthly", status: "canceled", current_period_end: until }), true, now);
  assert.equal(canceling.kind, "paid");
  assert.equal(canceling.canceling, true);
  assert.equal(accessFrom(row({ plan: "yearly", current_period_end: new Date(now - day).toISOString() }), true, now).kind, "expired");
  assert.equal(accessFrom(row({ plan: "yearly", status: "expired", current_period_end: until }), true, now).kind, "expired");
});

test("founder and comp: open-ended unless a period end is set", () => {
  assert.equal(accessFrom(row({ plan: "founder" }), true, now).kind, "paid");
  assert.equal(accessFrom(row({ plan: "comp", current_period_end: new Date(now - day).toISOString() }), true, now).kind, "expired");
});
