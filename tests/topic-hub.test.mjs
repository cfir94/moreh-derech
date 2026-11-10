import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { TOPIC_HUB, TOUR_HUB } from "../src/data/topic-hub.ts";
import { QUIZZES } from "../src/data/quizzes/index.ts";

const route = (href) => {
  const path = href.split(/[?#]/)[0].replace(/^\/|\/$/g, "");
  const quiz = path.match(/^quizzes\/([^/]+)$/);
  if (quiz && !["review", "dating", "timeline-drag"].includes(quiz[1])) return QUIZZES.some((q) => q.slug === quiz[1]);
  return existsSync(`src/app/${path}/page.tsx`);
};

test("every internal link in the topic hub points at a real page", () => {
  for (const group of [...TOPIC_HUB, ...TOUR_HUB]) for (const topic of group.topics) for (const link of topic.links) for (const item of link.items) {
    if (item.external) assert.match(item.href, /^https:\/\//, `${topic.id}: ${item.title}`);
    else assert.ok(route(item.href), `${topic.id}: ${item.href} has no page`);
  }
});

test("no empty rows, no duplicate topics, one button per kind", () => {
  const ids = new Set();
  for (const group of [...TOPIC_HUB, ...TOUR_HUB]) for (const topic of group.topics) {
    assert.ok(!ids.has(topic.id), `duplicate ${topic.id}`);
    ids.add(topic.id);
    assert.ok(topic.links.length > 0, `${topic.id} has no links`);
    const kinds = topic.links.map((l) => l.kind);
    assert.equal(new Set(kinds).size, kinds.length, `${topic.id} repeats a button kind`);
    for (const link of topic.links) assert.ok(link.items.length > 0, `${topic.id}/${link.kind} is empty`);
  }
});
