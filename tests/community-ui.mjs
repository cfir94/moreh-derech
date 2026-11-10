// הקהילה (C-10) בדפדפן, מול Supabase מדומה: רשימת פורומים עם "חדשות", כניסה לפורום ולנושא,
// תגובה, נושא חדש, בקשת הצטרפות והסתרה בידי מנהל. במחשב ובטלפון, בלי גלישה לרוחב ובלי שגיאות.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";

const out = resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/^\/moreh-derech(?=\/|$)/, "");
  let target = resolve(out, "." + pathname);
  if (!target.startsWith(out)) { res.writeHead(403).end(); return; }
  if (existsSync(target) && statSync(target).isDirectory()) target = resolve(target, "index.html");
  if (!existsSync(target)) { res.writeHead(404).end(); return; }
  res.setHeader("Content-Type", mime[extname(target)] ?? "application/octet-stream");
  res.end(readFileSync(target));
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = process.env.COMMUNITY_TEST_BASE_URL ?? `http://127.0.0.1:${server.address().port}/moreh-derech`;

const USER = "00000000-0000-4000-8000-000000000001";
const session = { access_token: "t", refresh_token: "r", user_id: USER, email: "student@example.com", display_name: "תלמידה" };

function fakeSupabase() {
  const now = new Date().toISOString();
  const db = {
    forums: [
      { id: 1, slug: "kmd-sharon-26-27", title: "קמ״ד שרון 26-27", description: "הפורום של המחזור", kind: "forum", member: true, can_open: true, request: "active", unread: 2, last_activity: now },
      { id: 2, slug: "announcements", title: "לוח פרסומים", description: "השתלמויות וקורסים", kind: "board", member: true, can_open: false, request: null, unread: 0, last_activity: now },
      { id: 3, slug: "other", title: "מחזור אחר", description: "", kind: "forum", member: false, can_open: false, request: null, unread: 0, last_activity: null },
    ],
    threads: [{ id: 10, forum_id: 1, author_id: "x", author_name: "דנה", title: "סיכום לשיעור על קיסריה", body: "הנה הסיכום: https://example.com/caesarea\nשורה שנייה", pinned: false, hidden: false, post_count: 1, last_post_at: now, created_at: now }],
    posts: [{ id: 100, thread_id: 10, author_id: "y", author_name: "יוסי", body: "תודה!", hidden: false, created_at: now }],
    joins: 0, hides: 0,
  };
  return async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const body = route.request().postDataJSON?.() ?? null;
    const path = url.pathname;
    if (path.endsWith("/rpc/md_my_forums")) return route.fulfill({ json: db.forums });
    if (path.endsWith("/rpc/is_app_admin")) return route.fulfill({ json: true });
    if (path.endsWith("/rpc/md_admin_forum_hide")) { db.hides += 1; const list = body.p_kind === "thread" ? db.threads : db.posts; const it = list.find((x) => x.id === body.p_id); if (it) it.hidden = body.p_hidden; return route.fulfill({ json: null }); }
    if (path.endsWith("/rpc/md_admin_forum_pin")) return route.fulfill({ json: null });
    if (path.endsWith("/md_threads") && method === "GET") {
      const id = url.searchParams.get("id"); const forum = url.searchParams.get("forum_id");
      if (id) return route.fulfill({ json: db.threads.filter((t) => `eq.${t.id}` === id) });
      return route.fulfill({ json: db.threads.filter((t) => `eq.${t.forum_id}` === forum) });
    }
    if (path.endsWith("/md_threads") && method === "POST") {
      const t = { id: 11, forum_id: body.forum_id, author_id: USER, author_name: "תלמידה", title: body.title, body: body.body, pinned: false, hidden: false, post_count: 0, last_post_at: now, created_at: now };
      db.threads.push(t); return route.fulfill({ json: [t] });
    }
    if (path.endsWith("/md_posts") && method === "GET") return route.fulfill({ json: db.posts.filter((p) => `eq.${p.thread_id}` === url.searchParams.get("thread_id")) });
    if (path.endsWith("/md_posts") && method === "POST") {
      const p = { id: 101 + db.posts.length, thread_id: body.thread_id, author_id: USER, author_name: "תלמידה", body: body.body, hidden: false, created_at: now };
      db.posts.push(p); return route.fulfill({ json: [p] });
    }
    if (path.endsWith("/md_forum_members") && method === "POST") { db.joins += 1; db.forums[2].request = "pending"; return route.fulfill({ status: 201, body: "" }); }
    if (path.endsWith("/md_forum_reads")) return route.fulfill({ status: 201, body: "" });
    return route.fulfill({ json: [] });
  };
}

const browser = await chromium.launch({ headless: true });
const errors = [];
let checks = 0;
try {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    await context.addInitScript((s) => localStorage.setItem("israel-geo-game-session", s), JSON.stringify(session));
    await context.route("**/*.supabase.co/**", fakeSupabase());
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(`${viewport.width}: ${e.message}`));
    page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(`${viewport.width}: ${m.text()}`); });
    const noOverflow = async (where) => expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${viewport.width} ${where}: overflow`).toBe(true);

    await page.goto(`${base}/community/`);
    await expect(page.getByText("2 חדשות")).toBeVisible();
    await expect(page.getByRole("button", { name: "בקשה להצטרף" })).toBeVisible();
    await noOverflow("forums"); checks += 1;

    await page.getByRole("button", { name: "בקשה להצטרף" }).click();
    await expect(page.getByText("הבקשה ממתינה לאישור")).toBeVisible(); checks += 1;

    await page.getByRole("link", { name: /קמ״ד שרון/ }).click();
    await expect(page.getByRole("link", { name: /סיכום לשיעור על קיסריה/ })).toBeVisible();
    await noOverflow("forum"); checks += 1;

    await page.getByRole("link", { name: /סיכום לשיעור על קיסריה/ }).click();
    await expect(page.getByRole("link", { name: "https://example.com/caesarea" })).toHaveAttribute("rel", /noopener/);
    await expect(page.getByText("תודה!")).toBeVisible();
    await page.getByLabel("תגובה").fill("גם ממני תודה");
    await page.getByRole("button", { name: "שליחה" }).click();
    await expect(page.getByText("גם ממני תודה")).toBeVisible(); checks += 1;

    await page.getByRole("button", { name: "הסתרה" }).first().click();
    await expect(page.getByText("· מוסתר").first()).toBeVisible(); checks += 1;
    await noOverflow("thread");

    await page.goBack(); await page.goBack();
    await page.goto(`${base}/community/?f=kmd-sharon-26-27&new=1`);
    await page.getByLabel("כותרת").fill("שאלה על בית שערים");
    await page.getByLabel("ההודעה").fill("מתי נבנו המערות?");
    await page.getByRole("button", { name: "פתיחת הנושא" }).click();
    await expect(page.getByRole("heading", { name: "שאלה על בית שערים" })).toBeVisible(); checks += 1;
    await context.close();
  }
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(JSON.stringify({ communityChecks: checks }));
} finally {
  await browser.close();
  server.close();
}
