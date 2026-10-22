import test from "node:test";
import assert from "node:assert/strict";
import { PERIOD_ROWS, PERIOD_GROUPS, filterPeriodRows, periodDateText } from "../src/data/periods.ts";

test("the source's 25 rows remain represented, with the two Hasmonean anchors separated", () => {
  assert.equal(PERIOD_ROWS.length, 26);
  assert.equal(new Set(PERIOD_ROWS.map(row => row.id)).size, 26);
  assert.deepEqual(PERIOD_ROWS.filter(row => row.year >= -167 && row.year <= -142).map(row => row.event), ["ראשית מרד החשמונאים", "המדינה החשמונאית — ימי שמעון"]);
  for (const [index, row] of PERIOD_ROWS.entries()) {
    assert(PERIOD_GROUPS.some(group => group.id === row.political));
    if (index) assert(row.year >= PERIOD_ROWS[index - 1].year, row.id + " chronological order");
    if (row.endYear !== undefined) assert(row.endYear >= row.year, row.id + " range direction");
  }
});

test("corrections retain the original dates and explain their basis", () => {
  for (const [id, year] of [["cyrus", -538], ["alexander", -332], ["third-century-crisis", 235], ["gallus", 351], ["sasanian-conquest", 614]]) {
    const row = PERIOD_ROWS.find(row => row.id === id);
    assert.equal(row.year, year);
    assert(row.originalDate && row.note && row.source);
  }
  assert.equal(PERIOD_ROWS.find(row => row.id === "sasanian-conquest").endYear, 628);
  assert.equal(periodDateText(PERIOD_ROWS.find(row => row.id === "herods-sons")), "4 לפנה״ס – 6 לספירה");
});

test("search combines text and political period without changing the underlying chronology", () => {
  assert.deepEqual(filterPeriodRows("הורדוס", "roman").map(row => row.id), ["herod", "herods-sons"]);
  assert.equal(filterPeriodRows("הורדוס", "persian").length, 0);
  assert.equal(filterPeriodRows("235", "all")[0].id, "third-century-crisis");
  assert.equal(filterPeriodRows("224", "all")[0].id, "third-century-crisis");
  assert.equal(filterPeriodRows("גָּאלוּס", "all")[0].id, "gallus");
  assert.equal(filterPeriodRows("", "all").length, 26);
});
