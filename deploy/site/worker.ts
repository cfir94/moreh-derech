// moreyderech.com — Worker קטן לפני הקבצים הסטטיים של האתר (out/ של Next).
//
// רץ רק על נתיבים מסוימים (ראו run_worker_first ב-wrangler.jsonc); כל שאר הבקשות מוגשות ישירות
// מ-Cloudflare בלי להפעיל קוד, ולכן אינן נספרות במכסת 100,000 הבקשות היומית של התוכנית החינמית.
//
// 1. /moreh-derech/... — הכתובת הישנה מ-GitHub Pages. בדף: הפניה קבועה (301) לאותו נתיב בלי
//    הקידומת, כדי שקישורים וסימניות ישנים יעבדו. בקובץ (תמונה, סקריפט): מגישים ישירות. נשארו
//    בנתונים מחרוזות קשיחות של "/moreh-derech/images/..." והן ממשיכות לעבוד.
// 2. קובץ המפה (95MB) גדול מהמגבלה של Cloudflare לקובץ סטטי (25MB). הוא מוחרג מההעלאה
//    (.assetsignore), ואפליקציית המפה טוענת אותו מכתובת חיצונית (ראו public/embeds/map/index.html).

import { handleLeadNotify, runDaily, type NotifyEnv } from "./notify.ts";

// 3. /api/lead-notify ו-cron יומי: הודעות של התשלום הידני (notify.ts).

export interface Env extends NotifyEnv {
  ASSETS: Fetcher;
}

const LEGACY = "/moreh-derech";

/** "/moreh-derech/quizzes/x/" → "/quizzes/x/". null אם הנתיב לא ישן. */
export function stripLegacy(pathname: string): string | null {
  if (pathname !== LEGACY && !pathname.startsWith(`${LEGACY}/`)) return null;
  return pathname.slice(LEGACY.length) || "/";
}

/** דף (ולא קובץ): בלי סיומת בסגמנט האחרון, או שמסתיים ב-/ או ב-.html. */
export function isPage(pathname: string): boolean {
  const last = pathname.split("/").pop() ?? "";
  return last === "" || last.endsWith(".html") || !last.includes(".");
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/lead-notify") {
      return handleLeadNotify(request, env).catch(() => new Response(null, { status: 502 }));
    }
    const stripped = stripLegacy(url.pathname);
    if (stripped !== null) {
      url.pathname = stripped;
      if (isPage(stripped) && (request.method === "GET" || request.method === "HEAD")) {
        return Response.redirect(url.toString(), 301);
      }
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }
    return env.ASSETS.fetch(request);
  },
  async scheduled(_event, env, ctx): Promise<void> {
    ctx.waitUntil(runDaily(env).then(() => undefined));
  },
} satisfies ExportedHandler<Env>;
