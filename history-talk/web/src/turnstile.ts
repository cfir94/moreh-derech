// Turnstile במצב שלא מפריע לגולש (interaction-only): מופיע רק אם Cloudflare צריך אינטראקציה.

interface TurnstileApi {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  reset(id: string): void;
  remove(id: string): void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | undefined;

function loadScript(): Promise<TurnstileApi> {
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
    s.onerror = () => reject(new Error("turnstile"));
    document.head.append(s);
  });
  return scriptPromise;
}

export class Turnstile {
  private id?: string;
  private api?: TurnstileApi;
  private token?: string;
  private waiters: ((t: string) => void)[] = [];
  private failers: ((e: Error) => void)[] = [];

  async mount(el: HTMLElement, sitekey: string): Promise<void> {
    this.api = await loadScript();
    this.id = this.api.render(el, {
      sitekey,
      appearance: "interaction-only",
      language: "he",
      callback: (t: string) => {
        this.token = t;
        this.waiters.splice(0).forEach((w) => w(t));
        this.failers = [];
      },
      "expired-callback": () => this.reset(),
      "error-callback": () => {
        this.failers.splice(0).forEach((f) => f(new Error("turnstile")));
        this.waiters = [];
      },
    });
  }

  /** אסימון חד-פעמי; אחרי השימוש מבקשים חדש (reset) לשיחה הבאה. */
  take(timeoutMs = 30_000): Promise<string> {
    if (this.token) {
      const t = this.token;
      this.token = undefined;
      return Promise.resolve(t);
    }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("turnstile timeout")), timeoutMs);
      this.waiters.push((t) => {
        clearTimeout(timer);
        this.token = undefined;
        resolve(t);
      });
      this.failers.push((e) => {
        clearTimeout(timer);
        reject(e);
      });
    });
  }

  reset(): void {
    this.token = undefined;
    if (this.api && this.id) this.api.reset(this.id);
  }
}
