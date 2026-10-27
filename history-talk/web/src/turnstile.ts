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
  private error?: Error;
  private waiters: ((t: string) => void)[] = [];
  private failers: ((e: Error) => void)[] = [];

  async mount(el: HTMLElement, sitekey: string): Promise<void> {
    this.api = await loadScript();
    this.id = this.api.render(el, {
      sitekey,
      appearance: "interaction-only",
      language: "he",
      callback: (t: string) => {
        this.error = undefined;
        this.token = t;
        this.waiters.splice(0).forEach((w) => w(t));
        this.failers = [];
      },
      "expired-callback": () => this.reset(),
      "error-callback": () => {
        this.error = new Error("turnstile");
        this.failers.splice(0).forEach((f) => f(this.error!));
        this.waiters = [];
      },
    });
  }

  /** אסימון חד-פעמי; אחרי השימוש מבקשים חדש (reset) לשיחה הבאה. */
  take(timeoutMs = 15_000): Promise<string> {
    if (this.error) return Promise.reject(this.error);
    if (this.token) {
      const t = this.token;
      this.token = undefined;
      return Promise.resolve(t);
    }
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        this.waiters = this.waiters.filter(w => w !== success);
        this.failers = this.failers.filter(f => f !== failure);
      };
      const success = (t: string) => {
        cleanup();
        this.token = undefined;
        resolve(t);
      };
      const failure = (e: Error) => {
        cleanup();
        reject(e);
      };
      const timer = setTimeout(() => failure(new Error("turnstile timeout")), timeoutMs);
      this.waiters.push(success);
      this.failers.push(failure);
    });
  }

  reset(): void {
    this.token = undefined;
    this.error = undefined;
    if (this.api && this.id) this.api.reset(this.id);
  }
}
