// גחליליות: נקודות אור קטנות שמרחפות לאט ומהבהבות על קנבס מאחורי הדמות.
// לולאת ציור אחת לכל הקנבסים בעמוד; קנבס שאינו על המסך לא מצויר. ב"הפחת תנועה" —
// ציור אחד סטטי, בלי לולאה.

interface Fly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  rate: number;
}

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** ערבוב צבע הדמות עם זהב חם, כדי שהגחליליות יהיו "אור" ולא כתמי צבע. */
function glowColor(accent: string): [number, number, number] {
  const m = accent.match(/^#?([0-9a-f]{6})$/i);
  const [r, g, b] = m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) : [255, 206, 77];
  const mix = (c: number, w: number) => Math.round(c * 0.35 + w * 0.65);
  return [mix(r, 255), mix(g, 222), mix(b, 150)];
}

export class Fireflies {
  private ctx: CanvasRenderingContext2D | null;
  private flies: Fly[] = [];
  private w = 0;
  private h = 0;
  private dpr = 1;
  private rgb: [number, number, number];
  /** 0–1: עוצמת הדיבור — הגחליליות מתבהרות מעט כשהדמות מדברת. */
  boost = 0;

  constructor(
    readonly canvas: HTMLCanvasElement,
    accent: string,
    private count: number,
  ) {
    this.ctx = canvas.getContext("2d");
    this.rgb = glowColor(accent);
    register(this);
  }

  /** מתאים את הקנבס לגודל שלו על המסך (ופוזר מחדש אם השתנה). */
  resize(): boolean {
    const { clientWidth: cw, clientHeight: ch } = this.canvas;
    if (!cw || !ch) return false;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cw === this.w && ch === this.h && dpr === this.dpr) return true;
    this.w = cw;
    this.h = ch;
    this.dpr = dpr;
    this.canvas.width = Math.round(cw * dpr);
    this.canvas.height = Math.round(ch * dpr);
    const area = (cw * ch) / (260 * 325);
    this.flies = Array.from({ length: Math.round(this.count * Math.min(2.2, Math.max(0.6, area))) }, () => ({
      x: Math.random() * cw,
      y: Math.random() * ch,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 2,
      r: 0.6 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      rate: 0.6 + Math.random() * 1.4,
    }));
    return true;
  }

  step(dt: number, t: number): void {
    const { ctx } = this;
    if (!ctx || !this.resize()) return;
    const { w, h } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    const [r, g, b] = this.rgb;
    for (const f of this.flies) {
      // שיטוט רך: שינוי קטן ואקראי בכיוון, ריסון, ונטייה קלה למעלה — כמו אוויר חם.
      f.vx += (Math.random() - 0.5) * 18 * dt;
      f.vy += ((Math.random() - 0.5) * 18 - 1.5) * dt;
      f.vx *= 1 - 0.6 * dt;
      f.vy *= 1 - 0.6 * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      if (f.x < -10) f.x = w + 10;
      if (f.x > w + 10) f.x = -10;
      if (f.y < -10) f.y = h + 10;
      if (f.y > h + 10) f.y = -10;
      const tw = 0.5 + 0.5 * Math.sin(t * f.rate + f.phase);
      const a = (0.15 + 0.75 * tw * tw) * (0.8 + this.boost * 0.5);
      const glow = f.r * (5 + this.boost * 3);
      const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, glow);
      grad.addColorStop(0, `rgba(${r},${g},${b},${Math.min(1, a)})`);
      grad.addColorStop(0.25, `rgba(${r},${g},${b},${a * 0.35})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(f.x, f.y, glow, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  destroy(): void {
    unregister(this);
  }
}

// ---- לולאה משותפת ----
const all = new Set<Fireflies>();
const visible = new Set<Fireflies>();
let raf = 0;
let last = 0;

const observer =
  typeof IntersectionObserver === "undefined"
    ? null
    : new IntersectionObserver((entries) => {
        for (const e of entries) {
          const ff = [...all].find((f) => f.canvas === e.target);
          if (!ff) continue;
          if (e.isIntersecting) visible.add(ff);
          else visible.delete(ff);
        }
        kick();
      });

function register(ff: Fireflies) {
  all.add(ff);
  if (observer) observer.observe(ff.canvas);
  else visible.add(ff);
  if (reducedMotion()) requestAnimationFrame(() => ff.step(0, 1.3));
  kick();
}

function unregister(ff: Fireflies) {
  all.delete(ff);
  visible.delete(ff);
  observer?.unobserve(ff.canvas);
}

function kick() {
  if (raf || reducedMotion() || !visible.size) return;
  last = performance.now();
  raf = requestAnimationFrame(frame);
}

function frame(now: number) {
  raf = 0;
  if (document.hidden || !visible.size) return;
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  for (const ff of visible) ff.step(dt, now / 1000);
  raf = requestAnimationFrame(frame);
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) kick();
});
