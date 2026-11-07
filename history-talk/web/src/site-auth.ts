// The user's Supabase session lives on the site (the parent window), not in this iframe. When the
// Worker enforces access (REQUIRE_ENTITLEMENT), the site hands the access token over postMessage
// and we forward it in X-MD-Auth. Only the direct parent is trusted: FRAME_ANCESTORS limits who can
// embed us, and a token only ever goes back to our own Worker.

// Typed loosely: the worker/test tsconfig has no DOM lib, and this also runs in Node tests.
interface MiniWindow {
  parent: MiniWindow;
  addEventListener(type: "message", fn: (event: { source: unknown; data: unknown }) => void): void;
  postMessage(message: unknown, targetOrigin: string): void;
}
const win = (globalThis as { window?: MiniWindow }).window;

let token: string | null = null;
let waiting: ((t: string | null) => void)[] = [];

if (win && win.parent !== win) {
  win.addEventListener("message", (event) => {
    if (event.source !== win.parent) return;
    const data = event.data as { type?: string; token?: unknown } | null;
    if (data?.type !== "md-auth") return;
    token = typeof data.token === "string" && data.token ? data.token : null;
    const ready = waiting;
    waiting = [];
    for (const resolve of ready) resolve(token);
  });
}

/** Asks the site for a fresh token (tokens expire hourly); falls back to the last one after a short wait. */
export function siteAuthToken(timeoutMs = 1500): Promise<string | null> {
  if (!win || win.parent === win) return Promise.resolve(null);
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      waiting = waiting.filter((w) => w !== done);
      resolve(token);
    }, timeoutMs);
    const done = (t: string | null) => {
      clearTimeout(timer);
      resolve(t);
    };
    waiting.push(done);
    win.parent.postMessage({ type: "md-auth-request" }, "*");
  });
}

export async function authHeaders(): Promise<Record<string, string>> {
  const t = await siteAuthToken();
  return t ? { "X-MD-Auth": t } : {};
}
