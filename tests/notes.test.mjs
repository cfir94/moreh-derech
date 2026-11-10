// הפתקים שלי: הפורמט המקומי, התרגום למסמך סנכרון, ומיזוג בין שני מכשירים.
import test from "node:test";
import assert from "node:assert/strict";
import { parseNotes } from "../src/lib/notes.ts";
import { NOTES_STORE, SYNC_STORES } from "../src/lib/sync/stores.ts";
import { mergeDocs, withDeletions } from "../src/lib/sync/merge.ts";

const note = (id, updatedAt, title = id) => ({ id, title, body: "", createdAt: 1, updatedAt });

test("parseNotes keeps valid notes, newest first, and survives junk", () => {
  const raw = JSON.stringify({ a: note("a", 5), b: note("b", 9), bad: { id: 3 } });
  assert.deepEqual(parseNotes(raw).map((n) => n.id), ["b", "a"]);
  assert.deepEqual(parseNotes("not json"), []);
  assert.deepEqual(parseNotes(JSON.stringify([note("x", 1)])), []);
});

test("the notes store round-trips through a sync document", () => {
  const raw = JSON.stringify({ a: note("a", 5), b: note("b", 9) });
  const back = JSON.parse(NOTES_STORE.fromDoc(NOTES_STORE.toDoc(raw)));
  assert.deepEqual(Object.keys(back).sort(), ["a", "b"]);
});

test("two devices merge: the later edit wins, a deletion does not come back", () => {
  const phone = NOTES_STORE.toDoc(JSON.stringify({ a: note("a", 10, "phone"), b: note("b", 4) }));
  const laptop = NOTES_STORE.toDoc(JSON.stringify({ a: note("a", 7, "laptop"), b: note("b", 4) }));
  // the laptop deleted b after it last synced
  laptop.collections.notes = withDeletions({ items: { a: note("a", 7, "laptop") }, gone: {} }, ["a", "b"], 20);
  const merged = mergeDocs(phone, laptop, NOTES_STORE.timeOf);
  const out = JSON.parse(NOTES_STORE.fromDoc(merged));
  assert.equal(out.a.title, "phone");
  assert.equal(out.b, undefined);
});

test("notes sync last, so a server that does not know them yet blocks nothing", () => {
  assert.equal(SYNC_STORES.at(-1), NOTES_STORE);
});
