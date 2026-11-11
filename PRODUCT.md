# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, one account (owner decision, 8.11.2026, `docs/product/AUDIENCE.md`):

1. **Students in the Israeli tour-guide licensing course** (קורס מורי דרך), preparing for the Ministry of Tourism licensing exam: quizzes, full past exams, review of mistakes, summaries.
2. **Working licensed tour guides**, preparing tours and refreshing knowledge: maps, route planning, notebooks, timelines, historical figures, tour reports.

Mostly aged 40–60. Hebrew speakers. Use is split roughly evenly between a computer at home (study sessions) and a phone in the field (on a tour, on a bus, at a site, in sunlight). Whoever starts as a student continues as a working guide on the same account and progress.

## Product Purpose

One place that gathers everything a guide-in-training or a working guide needs: question banks by topic, official licensing exams in real exam conditions, learning aids (timelines, a learning map, architecture studio, geology, flora and fauna guides), games, course videos, tour-report practice, personal notes, a community forum, and a voice conversation with historical figures. Success: a student passes the licensing exam, and then keeps using the same tools to prepare real tours.

## Positioning

Built from inside the course: every fact traces to the course's own lecturers, concept lists and NotebookLM notebooks, or to the official Ministry exams with their official keys; anything from outside the material is visibly marked "השלמה". Progress is tracked per question across all tools, so mistakes from any exam return for review. No neighbouring product combines the official exam archive, the course's own material and field tools for the same person across student and working-guide life.

## Operating Context

- Used both at a desk (long study sessions, full mock exams) and on a phone during tours (quick lookup on the learning map, a site card, a timeline).
- Israeli hiking and guiding culture: trail markings, national-park sites, survey maps, the guide's backpack and field notebook.
- Static site on GitHub Pages / moreyderech.com (Next.js static export, basePath `/moreh-derech`); auth and sync through the shared Supabase project of the "אבן דרך" game.
- Content in Hebrew, RTL. Exams can also appear in English and Arabic.

## Capabilities and Constraints

- Static export only; no server rendering. The only live service is the history-talk Cloudflare Worker.
- Dark mode is a first-class theme; all colour goes through tokens in `src/app/globals.css` (no raw Tailwind colours).
- Fonts are bundled locally (OFL) through `src/app/fonts.ts`; the build must not depend on Google Fonts.
- Quoted material (official exam questions, Efrat Nakash's link library) must not be altered or copied beyond what is allowed.
- Images: free-licence Wikimedia Commons photos with credit, each checked by eye; AI illustrations only where the owner approves them (history-atlas vignettes, Moti's portrait).
- Redesign rollout order (owner, 11.11.2026): first a few main pages (home, quizzes, some timelines) to feel the new language, then everything else. In the end everything is renewed, including the learning aids that currently have their own worlds.

## Brand Commitments

- Name stays: **"אבן דרך למורי דרך"**. A new logo for the site; the current logo (made for the trivia game) stays only inside the "אבן דרך" game.
- Owner's binding brief for the redesign (11.11.2026): the site should feel like something a tour guide pulled out of his backpack in the middle of a tour, a map or a teaching aid. Earth palette: light browns, dark browns, greens (soil, sand, vegetation). A distinctive travel/adventure typeface; headings possibly in Hebrew cursive handwriting (the rounded script people write by hand, not print). Background elements placed as if at random: footsteps, map markings, guiding marks. A consistent, original icon language used everywhere. The home screen opens with an animation of a map pulled from a backpack and unfolding into the main screen. Nothing that reads as generic or AI-made.
- **UI elements are physical objects from the guide's world** (owner, 11.11.2026, a general principle): a note is a real notebook page with ruled lines, a margin and paper grain, not a clean, cold text box. The same thinking applies to every element: signs, maps, rocks, tags, plates.
- Character intensity (owner): a strong frame (home, navigation, headings, icons, backgrounds) with clean, highly readable content (questions, exams, long text).
- Illustrations and asset folders (logo, textures, stamps, intro art) may be produced in ChatGPT from prompts we write; UI icons are drawn in code.

## Evidence on Hand

- Real content: 13 licensing sittings and 23 course exams, ~2,600 exam-bank questions, quizzes by topic, learning-map sites with checked photos, timelines, architecture photos (`public/architecture/photos/`), history-atlas illustrations, Moti's portrait.
- Real elevation tiles and geology layers (`public/embeds/map/`, `public/geology/`) usable for genuine relief and contour graphics.
- No testimonials, user counts or press exist; none may be invented.

## Product Principles

1. **Course truth first.** Every fact traces to the course material or the official exam; outside facts are marked "השלמה".
2. **One account for a whole career.** Student tools and working-guide tools are the same tools; nothing frames the guide as "only a student".
3. **Readable at 50 in the sun.** Large text, plain navigation, high contrast, on a phone outdoors as on a desktop.
4. **A field tool, not a brochure.** The site behaves like equipment a guide uses, and its character comes from the guide's real world.

## Accessibility & Inclusion

Audience is 40–60: generous type sizes, strong contrast in both themes, simple navigation, visible focus, reduced motion respected (the intro animation must be skippable and honour `prefers-reduced-motion`). Israeli accessibility regulations apply (accessibility statement exists under `/legal`).
