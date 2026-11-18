---
name: article-writer
description: Write an open article for the site's article section (/articles), in a story-driven, light, field-anchored voice for tour guides and students, that also ranks in Google and is quoted by AI search. Use when writing, rewriting or planning an article, or when the owner asks for "a post" or "an article" on a topic.
---

# Writing an article for "אבן דרך"

## Who the article is for
- **Readers:** a tour guide aged 40–60, or a student in the course. They know a little, love the land, and read on a phone.
- **What they should take away:** something they can say to a group tomorrow morning.
- **The article is the door to the site:** it is open to everyone and it stands on its own. It is not a teaser. At the end it points to the tool on the site that deepens it: a timeline, the learning map, a quiz or a game.

## The facts
- **Course material first.** The order of sources:
  1. the course notebooks (NotebookLM);
  2. the site's data (`src/data/**`);
  3. official and open sources (gov.il, the Israel Antiquities Authority, the Nature and Parks Authority, Wikipedia).
- **No guesswork.** A fact that isn't certain doesn't go in.
- **Tradition is marked as tradition:** "לפי המסורת", "לפי ספר שמואל".
- **Not copied:**
  - nothing from another writer: not Netanel Elinson, not Efrat Nakash, not the course lecturers;
  - not their structure, not their examples and not their mnemonics.

  We take the voice and the craft, not the content.
- **A quotation from a primary source** (a verse, Josephus, the Mishnah) is cited with its exact reference. Keep it short.

## The voice
- **Opening with a hook that ties today to the past.** A familiar place, an event in the news, a question a tourist asks. Not "בתקופה הרומית…".
- **A story with people.** Who was there, what they wanted, what the land did to them.
- **The land as interpreter.** Where exactly it happened, what you see from there today, a landmark the reader knows (a road number, a petrol station, a lookout).
- **Spoken Hebrew, short sentences.** One idea per paragraph. Occasionally "כן כן" or "וזה לא סתם". Not slang, not a lecture.
- **A small surprise in every section.** The meaning of a name, a fact that contradicts what everyone "knows", a link between two places.
- **No AI tells:**
  - no "זה לא X, זה Y";
  - no list of three in a row;
  - no sentence ending in a trail of commas;
  - no "בעולם של היום";
  - no "חשוב לציין".

## What we learned from the "Tanach Israeli" post (Sennacherib and Hezekiah, 17.11.2026)
The craft only; the content is his.
- **A question that reverses a familiar truth:** "We all know about the wars between brothers… but is there an opposite example?" This makes the reader stop.
- **A personal invitation and a reading time:** "four minutes of reading". This lowers the barrier for someone scrolling through Facebook.
- **The map as a character:** "Let's start from the blue dot on the right of the map". A real map the guide makes, which the text walks through step by step.
- **Three layers in one story:**
  - the land (the Gihon, the tunnel, the wall);
  - the source (a short verse, a midrash, an Assyrian inscription);
  - the people (Rabshakeh, Shebna).
- **A precise number that sticks:** the tunnel is half a kilometre long and drops only 33 centimetres, and 46 cities fell.
- **An ending that brings the lesson to today's Israeli society.** One idea, not a sermon.
- **A call to respond** at the end, which feeds the reach.

## A topical hook (the owner, 18.11)
- **What people read:** content that connects to the news.
- **Good triggers:**
  - a new discovery or find;
  - a species going extinct or rediscovered;
  - floods in the desert, explained through geology and geography;
  - an anniversary;
  - a site opening or closing.
- **Evergreen articles are fine too.** Not every article has to be topical, but when news is fresh it's worth writing quickly.
- **A topical article still needs a source** (the IAA, the Nature and Parks Authority, a news site), cited by name and date, and the course material behind it.
- **The audience is guides, not the general public.** The lesson at the end is "what to tell the group about this", not a sermon about society.

## Structure
1. **Title as a question or a promise**, up to 60 characters. For example: "למה כנסיית המולד נבנתה פעמיים?"
2. **Lede:** 2–3 sentences that answer the title in short. This is also the meta `description`, up to 155 characters.
3. **Numbered sections** (1, 2, 3…), each 2–4 paragraphs. A sub-heading only where it helps scanning.
4. **"מה אומרים לקבוצה":** a box with 2–3 sentences, word for word, that a guide can say at the site.
5. **"למבחן":** what the licensing exam asks about the topic. Only from the site's questions.
6. **Ending:** a line that brings the hook back, and a link to the tool on the site.
7. **Image:** one real photo, from Wikimedia Commons, with credit (author, licence, link) under it, as on the rest of the site.

## Length and SEO
- **Length:** 700–1,400 words. Better short and full than long and thin.
- **The search question:** one question that people actually search for, in the title, the first paragraph and one sub-heading. No keyword stuffing.
- **Structure for AI search:** an `Article` schema (author, date, image) and a `FAQPage` schema when there's a list of questions at the end. AI engines cite a clear answer at the top of the article, so the lede answers directly.
- **Internal links:** 2–4 to tools on the site, and 1–2 to other articles.

## Checks before submitting
- [ ] Every fact appears in the course material or the site's data, or comes with a source.
- [ ] No paragraph resembles a text you've seen elsewhere.
- [ ] The "מה אומרים לקבוצה" box works out loud.
- [ ] The title is up to 60 characters; the lede is up to 155.
- [ ] The image has credit.
- [ ] Dates are written `לפנה״ס` / `לספירה`, with ranges as `RangeText`.
