// הדמות על המסך: "חלון" שחור, ובו הילה של אור עגולה מאחורי הדמות, גחליליות שמרחפות ברקע,
// והדמות עצמה — דיוקן חתוך (רקע שקוף) בצילום בינוני. שכבות בעומק שונה זזות מעט זו מול זו
// (תלת־ממד עדין): לבד בתנועה איטית, ולפי הסמן כשהוא מעל הדמות. בזמן דיבור ההילה פועמת
// לפי עוצמת הקול וגלים יוצאים ממנה. כשאין עדיין דיוקן — מונוגרמה בתוך ההילה.

import type { PublicCharacter } from "./characters.ts";
import { Fireflies } from "./fireflies.ts";

function initials(name: string): string {
  const words = name.split(/\s+/).filter((w) => !["בן", "בת", "רבי", "רבן"].includes(w));
  return words.slice(0, 2).map((w) => w[0]).join("");
}

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export class Avatar {
  readonly el: HTMLElement;
  private scene: HTMLElement;
  private fireflies?: Fireflies;
  private idle?: HTMLVideoElement;
  private talking?: HTMLVideoElement;
  private pointer = { x: 0, y: 0, at: -Infinity };
  private raf = 0;

  constructor(c: PublicCharacter, opts: { size?: "card" | "stage" } = {}) {
    this.el = document.createElement("div");
    this.el.className = `avatar-wrap ${opts.size ?? "card"}`;
    this.el.style.setProperty("--accent", c.accentColor);
    this.el.setAttribute("role", "img");
    this.el.setAttribute("aria-label", c.portraitCredit ? `${c.nameHe} — ${c.portraitCredit.alt}` : c.nameHe);

    const canvas = document.createElement("canvas");
    canvas.className = "fireflies";
    canvas.setAttribute("aria-hidden", "true");

    this.scene = document.createElement("div");
    this.scene.className = "scene";
    const halo = document.createElement("div");
    halo.className = "halo";
    const haloRing = document.createElement("div");
    haloRing.className = "halo-ring";
    this.scene.append(halo, haloRing);
    for (let i = 0; i < 2; i++) {
      const ring = document.createElement("span");
      ring.className = "ring";
      this.scene.append(ring);
    }
    const figure = document.createElement("div");
    figure.className = "figure";
    this.scene.append(figure);
    for (const n of this.scene.children) n.setAttribute("aria-hidden", "true");

    if (c.media.idle && c.media.talking) {
      this.idle = this.video(c.media.idle, c.media.idleWebm, c.media.portrait);
      this.talking = this.video(c.media.talking, c.media.talkingWebm, c.media.portrait);
      this.talking.classList.add("hidden");
      figure.append(this.idle, this.talking);
      this.el.classList.add("has-video");
    } else if (c.media.portrait) {
      const img = document.createElement("img");
      img.src = c.media.portrait;
      img.alt = "";
      img.decoding = "async";
      img.draggable = false;
      figure.append(img);
      this.el.classList.add("has-portrait");
    } else {
      const mono = document.createElement("span");
      mono.className = "monogram";
      mono.textContent = initials(c.nameHe);
      figure.append(mono);
    }

    this.el.append(canvas, this.scene);
    this.fireflies = new Fireflies(canvas, c.accentColor, opts.size === "stage" ? 34 : 18);

    if (!reducedMotion()) {
      this.el.addEventListener("pointermove", (e) => {
        const r = this.el.getBoundingClientRect();
        this.pointer = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1, at: performance.now() };
      });
      this.el.addEventListener("pointerleave", () => (this.pointer.at = -Infinity));
      this.tilt();
    }
  }

  /**
   * הטיה איטית של הסצנה: תנודה עצמית רכה, ומעבר חלק אל כיוון הסמן כשהוא מעל הדמות.
   * רק כשהדמות גלויה על המסך.
   */
  private tilt(): void {
    let rx = 0;
    let ry = 0;
    let seen = true;
    const seed = Math.random() * 100;
    new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen && !this.raf) this.raf = requestAnimationFrame(loop);
    }).observe(this.el);
    const loop = (now: number) => {
      this.raf = 0;
      if (!seen || !this.el.isConnected) return;
      const t = now / 1000 + seed;
      const live = now - this.pointer.at < 2500;
      const tx = live ? -this.pointer.y * 7 : Math.cos(t * 0.21) * 2.2;
      const ty = live ? this.pointer.x * 10 : Math.sin(t * 0.27) * 3.5;
      rx += (tx - rx) * 0.06;
      ry += (ty - ry) * 0.06;
      this.scene.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      this.scene.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private video(mp4: string, webm: string | null, poster: string | null): HTMLVideoElement {
    const v = document.createElement("video");
    v.muted = true;
    v.loop = true;
    v.autoplay = true;
    v.playsInline = true;
    if (poster) v.poster = poster;
    if (webm) {
      const s = document.createElement("source");
      s.src = webm;
      s.type = "video/webm";
      v.append(s);
    }
    const s = document.createElement("source");
    s.src = mp4;
    s.type = "video/mp4";
    v.append(s);
    return v;
  }

  setSpeaking(speaking: boolean): void {
    this.el.classList.toggle("speaking", speaking);
    if (!this.idle || !this.talking) return;
    const [show, hide] = speaking ? [this.talking, this.idle] : [this.idle, this.talking];
    show.classList.remove("hidden");
    void show.play().catch(() => {});
    hide.classList.add("hidden");
  }

  /** עוצמת הדיבור 0–1: ההילה מתבהרת ומתרחבת, והגחליליות מתבהרות. */
  setLevel(level: number): void {
    this.el.style.setProperty("--level", level.toFixed(3));
    if (this.fireflies) this.fireflies.boost = level;
  }
}
