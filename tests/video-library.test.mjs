import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CLASS_VIDEO_SECTIONS, classRecordingCount, classVideoCount } from "../src/data/class-videos.ts";
import { videoGroups } from "../src/data/videos.ts";
import { findVideoSelection, selectedVideoPart, videoPlayerUrl, videoSelectionHref, formatVideoDuration } from "../src/lib/videoPlayback.ts";
import { classRecordingSearchResults } from "../src/lib/videoSearch.ts";

const snapshot = JSON.parse(readFileSync(new URL("../src/data/class-video-parts.json", import.meta.url), "utf8"));
const collections = CLASS_VIDEO_SECTIONS.flatMap((section) => section.groups.flatMap((group) => group.items));
const sections = [...CLASS_VIDEO_SECTIONS, { id: "enrichment", groups: videoGroups }];

test("all 41 scanned playlists have exactly one collection with all ordered video parts", () => {
  assert.equal(classVideoCount, 41);
  assert.equal(new Set(collections.map((item) => item.id)).size, 41);
  assert.deepEqual(new Set(collections.map((item) => item.playlistId)), new Set(Object.keys(snapshot.playlists)));
  let memberships = 0;
  for (const item of collections) {
    assert.ok(item.parts.length > 0, item.id);
    assert.deepEqual(item.parts, snapshot.playlists[item.playlistId]);
    assert.equal(new Set(item.parts.map((part) => part.id)).size, item.parts.length);
    for (const part of item.parts) {
      assert.match(part.id, /^[A-Za-z0-9_-]{11}$/);
      assert.ok(part.title);
      assert.ok(part.durationSeconds > 0);
    }
    memberships += item.parts.length;
  }
  assert.equal(memberships, 385);
  assert.equal(classRecordingCount, 336);
});

test("online courses remain unified with all eleven units and no nested topic divisions", () => {
  const online = CLASS_VIDEO_SECTIONS.find((section) => section.id === "online");
  assert.equal(online.groups.length, 1);
  assert.equal(online.groups[0].items.length, 11);
  assert.deepEqual(new Set(online.groups[0].items.map((item) => item.subtopic.id)), new Set(["online-all"]));
  assert.equal(online.groups[0].items.reduce((count, item) => count + item.parts.length, 0), 55);
});

test("all previously published collection deep links and enrichment remain available", () => {
  for (const id of ["online-iron-age-one", "tour-megiddo-gilboa", "class-christianity", "tour-gezer-afek", "legend-of-destruction", "tohu-va-vohu"]) {
    assert.ok(findVideoSelection(sections, id), id);
  }
  assert.equal(findVideoSelection(sections, "does-not-exist"), undefined);
  assert.equal(videoGroups.flatMap((group) => group.items).length, 60);
});

test("video part links choose a specific video, and invalid part IDs fall back safely", () => {
  for (const item of collections) {
    assert.equal(selectedVideoPart(item, "not-a-member").id, item.parts[0].id);
    for (const part of item.parts) {
      assert.equal(selectedVideoPart(item, part.id), part);
      const link = new URL(videoSelectionHref(item.id, part.id), "https://example.com");
      assert.equal(link.searchParams.get("video"), item.id);
      assert.equal(link.searchParams.get("part"), part.id);
      const player = new URL(videoPlayerUrl(item, part.id, false, "https://example.com"));
      assert.equal(player.pathname, `/embed/${part.id}`);
      assert.equal(player.searchParams.get("origin"), "https://example.com");
      assert.equal(player.searchParams.has("list"), false);
      assert.equal(player.searchParams.get("autoplay"), null);
    }
  }
  const item = collections[0];
  assert.equal(new URL(videoPlayerUrl(item, item.parts[0].id, true)).searchParams.get("autoplay"), "1");
});

test("recording search exposes every video once, with resolvable internal part links", () => {
  const results = classRecordingSearchResults();
  assert.equal(results.length, 336);
  assert.equal(new Set(results.map((result) => result.id)).size, 336);
  for (const result of results) {
    const href = new URL(result.href, "https://example.com");
    const selection = findVideoSelection(sections, href.searchParams.get("video"));
    assert.ok(selection, result.href);
    assert.ok(selection.item.parts.find((part) => part.id === href.searchParams.get("part")), result.href);
  }
  assert.ok(results.some((result) => result.title.includes("מנהרות הכותל")));
  assert.ok(results.some((result) => result.title.includes("טקסונומיה")));
});

test("overlapping official collections retain their complete memberships", () => {
  const day = collections.find((item) => item.id === "tour-carmel-course");
  const full = collections.find((item) => item.id === "tour-carmel-full");
  assert.equal(day.parts.length, 13);
  assert.equal(full.parts.length, 33);
  const fullIds = new Set(full.parts.map((part) => part.id));
  assert.ok(day.parts.every((part) => fullIds.has(part.id)));
});

test("duration labels support short and long recordings", () => {
  assert.equal(formatVideoDuration(59), "0:59");
  assert.equal(formatVideoDuration(2417), "40:17");
  assert.equal(formatVideoDuration(7124), "1:58:44");
  assert.equal(formatVideoDuration(), "");
});

test("collection selection and current collection title appear before the player, parts below it", () => {
  const source = readFileSync(new URL("../src/components/videos/VideoLibrary.tsx", import.meta.url), "utf8");
  const selection = source.indexOf('<section aria-label="בחירת קורס או אוסף"');
  const player = source.indexOf('aria-label="הנגן הנבחר"');
  const heading = source.indexOf('<h2 className="mt-1 text-lg leading-snug text-txt">{activeVideo.title}</h2>');
  const frame = source.indexOf('<YouTubePlayer');
  const parts = source.indexOf('<LessonPlaylist');
  assert.ok(selection > 0 && selection < player);
  assert.ok(player < heading && heading < frame);
  assert.ok(frame < parts);
  assert.equal(source.split('<section aria-label="בחירת קורס או אוסף"').length - 1, 1);
});
