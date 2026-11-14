import { test } from "node:test";
import assert from "node:assert/strict";
import { isolateRanges } from "../src/lib/bidi.ts";

const LRI = "⁦";
const PDI = "⁩";

test("a range with thousands separators stays one left-to-right run", () => {
  // the owner's report: "12,500–9,500 לפנה״ס" came out as "500,500–9,12"
  assert.equal(isolateRanges("12,500–9,500 לפנה\"ס"), `${LRI}12,500–9,500${PDI} לפנה"ס`);
  assert.equal(isolateRanges("לפני 250–50 אלף שנה"), `לפני ${LRI}250–50${PDI} אלף שנה`);
});

test("decimals, lists and Hebrew prefixes", () => {
  assert.equal(isolateRanges("3.6 מיליון"), `${LRI}3.6${PDI} מיליון`);
  assert.equal(isolateRanges("1563, 1565"), `${LRI}1563, 1565${PDI}`);
  assert.equal(isolateRanges("ה-5"), "ה-5");
  // a comma before a Hebrew word ends the run
  assert.equal(isolateRanges("בשנת 70, ובשנת 135"), `בשנת ${LRI}70${PDI}, ובשנת ${LRI}135${PDI}`);
});

test("every isolate is closed", () => {
  for (const text of ["705–701", "12,500–9,500", "שנה 1", "א-ב", ""]) {
    const out = isolateRanges(text);
    assert.equal(out.split(LRI).length, out.split(PDI).length);
  }
});
