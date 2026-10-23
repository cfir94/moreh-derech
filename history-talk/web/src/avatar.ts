// הדמות על המסך: לולאת "מקשיב" ולולאת "מדבר" (מעבר רך ביניהן), או דיוקן עם הנפשת
// CSS עדינה, או — כשאין מדיה עדיין — מונוגרמה בצבע הדמות.

import type { PublicCharacter } from "./characters.ts";

function initials(name: string): string {
  const words = name.split(/\s+/).filter((w) => !["בן", "בת"].includes(w));
  return words.slice(0, 2).map((w) => w[0]).join("");
}

export class Avatar {
  readonly el: HTMLElement;
  private idle?: HTMLVideoElement;
  private talking?: HTMLVideoElement;

  constructor(c: PublicCharacter) {
    this.el = document.createElement("div");
    this.el.className = "avatar";
    this.el.style.setProperty("--accent", c.accentColor);
    this.el.setAttribute("role", "img");
    this.el.setAttribute("aria-label", `${c.nameHe} — שחזור מבוסס בינה מלאכותית`);

    if (c.media.idle && c.media.talking) {
      this.idle = this.video(c.media.idle, c.media.idleWebm, c.media.portrait);
      this.talking = this.video(c.media.talking, c.media.talkingWebm, c.media.portrait);
      this.talking.classList.add("hidden");
      this.el.append(this.idle, this.talking);
      this.el.classList.add("has-video");
    } else if (c.media.portrait) {
      const img = document.createElement("img");
      img.src = c.media.portrait;
      img.alt = "";
      this.el.append(img);
      this.el.classList.add("has-portrait");
    } else {
      const mono = document.createElement("span");
      mono.className = "monogram";
      mono.textContent = initials(c.nameHe);
      mono.setAttribute("aria-hidden", "true");
      this.el.append(mono);
    }
  }

  private video(mp4: string, webm: string | null, poster: string | null): HTMLVideoElement {
    const v = document.createElement("video");
    v.muted = true;
    v.loop = true;
    v.autoplay = true;
    v.playsInline = true;
    v.setAttribute("aria-hidden", "true");
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

  /** עוצמת הדיבור 0–1, לזוהר. */
  setLevel(level: number): void {
    this.el.style.setProperty("--level", level.toFixed(3));
  }
}
