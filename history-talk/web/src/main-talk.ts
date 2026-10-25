// עמוד השיחה (talk.html?c=<id>&embed=1): מסך פתיחה, מיקרופון, השמעה, דמות, תמלול,
// כתיבה במקום דיבור, מקורות, טיימר, חיבור מחדש והודעות תקלה בעברית.

import { Avatar } from "./avatar.ts";
import { Mic } from "./audio/mic.ts";
import { Player } from "./audio/player.ts";
import { applyTheme, bidiYears, embed, loadCharacters, params, readSettings, saveSettings, withParams } from "./characters.ts";
import { ApiError, LiveClient, type LiveEvent } from "./live-client.ts";
import { QuizBank, type QuizShown } from "./quiz.ts";
import { SourceSearch, type Passage } from "./search.ts";
import { Turnstile } from "./turnstile.ts";

applyTheme();

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const ui = {
  talk: $("talk"),
  back: $<HTMLAnchorElement>("back"),
  avatarSlot: $("avatar-slot"),
  name: $("char-name"),
  meta: $("char-meta"),
  status: $("status"),
  timer: $("timer"),
  warning: $("warning"),
  error: $("error"),
  errorText: $("error-text"),
  openWindow: $<HTMLAnchorElement>("open-window"),
  textOnly: $<HTMLButtonElement>("text-only"),
  prestart: $("prestart"),
  consent: $<HTMLInputElement>("consent"),
  consentRow: $("consent-row"),
  turnstile: $("turnstile"),
  start: $<HTMLButtonElement>("start"),
  controls: $("controls"),
  mute: $<HTMLButtonElement>("mute"),
  end: $<HTMLButtonElement>("end"),
  samples: $("samples"),
  typeForm: $<HTMLFormElement>("type-form"),
  typeInput: $<HTMLInputElement>("type-input"),
  toggleTranscript: $<HTMLButtonElement>("toggle-transcript"),
  transcript: $<HTMLOListElement>("transcript"),
  sources: $<HTMLUListElement>("sources"),
  allSources: $<HTMLUListElement>("all-sources"),
  quizPanel: $("quiz-panel"),
  quizCards: $<HTMLOListElement>("quiz-cards"),
};

const STATUS_TEXT = {
  idle: "מוכן לשיחה",
  mic: "מבקש גישה למיקרופון…",
  connecting: "מתחבר…",
  live: "בשיחה — אפשר לדבר",
  speaking: "מדבר…",
  reconnecting: "מתחבר מחדש…",
  closed: "השיחה הסתיימה",
} as const;

ui.back.href = withParams("./");
const inFrame = window.self !== window.top;

/** המסגרת שמטמיעה אותנו לא נתנה allow="microphone" (ב-Chrome השגיאה אז אינה NotAllowedError). */
function micBlockedByPolicy(): boolean {
  const doc = document as Document & { permissionsPolicy?: { allowsFeature(f: string): boolean }; featurePolicy?: { allowsFeature(f: string): boolean } };
  const policy = doc.permissionsPolicy ?? doc.featurePolicy;
  return policy?.allowsFeature("microphone") === false;
}

let client: LiveClient | undefined;
let mic: Mic | undefined;
let player: Player | undefined;
let avatar: Avatar | undefined;
let timerHandle: number | undefined;
let levelHandle: number | undefined;
let textOnlyMode = false;
let maxMinutes = 12;
const turnstile = new Turnstile();

function setStatus(key: keyof typeof STATUS_TEXT) {
  ui.status.textContent = STATUS_TEXT[key];
  ui.status.dataset.state = key;
}

function showError(message: string, opts: { openWindow?: boolean; textOnly?: boolean } = {}) {
  ui.errorText.textContent = message;
  ui.openWindow.hidden = !opts.openWindow;
  if (opts.openWindow) ui.openWindow.href = location.href.replace(/([?&])embed=1&?/, "$1").replace(/[?&]$/, "");
  ui.textOnly.hidden = !opts.textOnly;
  ui.error.hidden = false;
}

function clearError() {
  ui.error.hidden = true;
}

// ---- תמלול: שברי טקסט מאותו דובר מצטרפים לשורה אחת עד שהתור מתחלף ----
let currentLine: { who: "user" | "model"; el: HTMLLIElement } | undefined;

function addTranscript(who: "user" | "model", text: string, characterName: string) {
  if (!currentLine || currentLine.who !== who) {
    const li = document.createElement("li");
    li.className = who;
    const label = document.createElement("strong");
    label.textContent = who === "user" ? "את/ה: " : `${characterName}: `;
    li.append(label, document.createTextNode(""));
    ui.transcript.append(li);
    currentLine = { who, el: li };
  }
  currentLine.el.lastChild!.textContent += text;
  ui.transcript.scrollTop = ui.transcript.scrollHeight;
}

const mentioned = new Set<string>();
function addSources(passages: Passage[]) {
  for (const p of passages) {
    if (mentioned.has(p.ref)) continue;
    mentioned.add(p.ref);
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = p.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = p.ref;
    li.append(a);
    ui.sources.prepend(li);
  }
}

// שאלות הבוחן של מורה הדרך: מקופלות, כדי שלא יקדימו את מה שהוא שואל בקול; התשובה לא מגיעה לכאן בכלל.
function addQuizCards(questions: QuizShown[]) {
  ui.quizPanel.hidden = false;
  for (const q of questions) {
    const li = document.createElement("li");
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = q.ref;
    const text = document.createElement("p");
    text.textContent = q.question;
    details.append(summary, text);
    if (q.options) {
      const ol = document.createElement("ol");
      for (const o of q.options) {
        const opt = document.createElement("li");
        opt.textContent = o;
        ol.append(opt);
      }
      details.append(ol);
    }
    const a = document.createElement("a");
    a.href = q.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "לשאלון באתר";
    details.append(a);
    li.append(details);
    ui.quizCards.append(li);
  }
}

function setTranscriptVisible(visible: boolean) {
  ui.transcript.hidden = !visible;
  ui.toggleTranscript.textContent = visible ? "הסתר" : "הצג";
  ui.toggleTranscript.setAttribute("aria-expanded", String(visible));
  saveSettings({ showTranscript: visible });
}

// ---- טיימר: גלוי, אזהרה דקה לפני הסוף, ופרידה בסוף הזמן ----
function startTimer(startedAt: number) {
  stopTimer();
  ui.timer.hidden = false;
  const tick = () => {
    const left = Math.max(0, startedAt + maxMinutes * 60_000 - Date.now());
    const m = Math.floor(left / 60_000);
    const s = Math.floor((left % 60_000) / 1000);
    ui.timer.textContent = `נותרו ${m}:${String(s).padStart(2, "0")}`;
    ui.warning.hidden = !(left > 0 && left <= 60_000);
    if (left === 0) {
      stopTimer();
      client?.farewell();
    }
  };
  tick();
  timerHandle = window.setInterval(tick, 1000);
}

function stopTimer() {
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = undefined;
}

function teardown() {
  stopTimer();
  if (levelHandle) cancelAnimationFrame(levelHandle);
  levelHandle = undefined;
  mic?.stop();
  mic = undefined;
  player?.close();
  player = undefined;
  avatar?.setSpeaking(false);
  avatar?.setLevel(0);
  ui.controls.hidden = true;
  ui.typeForm.hidden = true;
  ui.warning.hidden = true;
  ui.prestart.hidden = false;
  ui.start.disabled = false;
  ui.start.textContent = "שיחה חדשה";
  turnstile.reset();
}

async function main() {
  const id = params.get("c") ?? readSettings().lastCharacter ?? "";
  const chars = await loadCharacters();
  const c = chars.find((x) => x.id === id);
  if (!c) {
    location.replace(withParams("./"));
    return;
  }
  saveSettings({ lastCharacter: c.id });
  document.title = `${c.nameHe} — דבר עם ההיסטוריה`;
  document.documentElement.style.setProperty("--accent", c.accentColor);
  ui.talk.hidden = false;

  avatar = new Avatar(c, { size: "stage" });
  ui.avatarSlot.append(avatar.el);
  if (c.portraitCredit) {
    // רישיונות CC BY-SA דורשים קרדיט וקישור לרישיון.
    const credit = document.createElement("p");
    credit.className = "portrait-credit";
    const src = document.createElement("a");
    src.href = c.portraitCredit.url;
    src.target = "_blank";
    src.rel = "noopener";
    src.textContent = c.portraitCredit.text;
    const lic = document.createElement("a");
    lic.href = c.portraitCredit.licenseUrl;
    lic.target = "_blank";
    lic.rel = "noopener";
    lic.textContent = c.portraitCredit.license;
    credit.append(src, " · ", lic);
    ui.avatarSlot.append(credit);
  }
  ui.name.textContent = c.nameHe;
  ui.meta.append(...bidiYears(`${c.years} · ${c.taglineHe}`));
  for (const s of c.sources) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = s.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = s.title;
    li.append(a, document.createTextNode(` — ${s.translator} (${s.license})`));
    ui.allSources.append(li);
  }

  const settings = readSettings();
  ui.consent.checked = settings.consent === true;
  ui.consent.addEventListener("change", () => saveSettings({ consent: ui.consent.checked }));
  setTranscriptVisible(settings.showTranscript !== false);
  ui.toggleTranscript.addEventListener("click", () => setTranscriptVisible(ui.transcript.hidden));

  const search = new SourceSearch(`/data/${c.id}/index.json`);
  const bank = c.quiz ? new QuizBank(`/data/${c.id}/questions.json`) : undefined;

  for (const q of c.sampleQuestionsHe) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = q;
    b.addEventListener("click", () => {
      if (!client) return;
      client.sendText(q);
      currentLine = undefined;
      addTranscript("user", q, c.nameHe);
      currentLine = undefined;
    });
    ui.samples.append(b);
  }
  ui.samples.hidden = true;

  const config = await fetch("/api/config")
    .then((r) => r.json() as Promise<{ turnstileSiteKey: string; maxSessionMinutes: number }>)
    .catch(() => undefined);
  if (config) {
    maxMinutes = config.maxSessionMinutes;
    turnstile.mount(ui.turnstile, config.turnstileSiteKey).catch(() => {
      showError("לא הצלחנו לטעון את בדיקת האבטחה. רענן את הדף.");
    });
  }

  const onEvent = (e: LiveEvent) => {
    switch (e.type) {
      case "status":
        if (e.status === "closed") {
          setStatus("closed");
          teardown();
        } else setStatus(e.status);
        break;
      case "audio":
        player?.enqueue(e.pcm);
        break;
      case "interrupted":
        player?.interrupt();
        currentLine = undefined;
        break;
      case "turnComplete":
        currentLine = undefined;
        break;
      case "transcript":
        addTranscript(e.who, e.text, c.nameHe);
        break;
      case "sources":
        addSources(e.passages);
        break;
      case "quiz":
        addQuizCards(e.questions);
        break;
      case "error":
        showError(e.message);
        break;
    }
  };

  async function start() {
    clearError();
    if (!ui.consent.checked) {
      ui.consentRow.classList.add("shake");
      setTimeout(() => ui.consentRow.classList.remove("shake"), 500);
      ui.consent.focus();
      return;
    }
    if (!config) {
      showError("השרת לא זמין כרגע. נסה שוב בעוד כמה דקות.");
      return;
    }
    ui.start.disabled = true;
    ui.transcript.replaceChildren();
    ui.quizCards.replaceChildren();
    ui.quizPanel.hidden = true;
    currentLine = undefined;

    // בתוך הלחיצה: יוצרים את ההשמעה ומבקשים מיקרופון (מדיניות הדפדפנים).
    player = new Player();
    await player.resume();
    player.onPlayingChange = (playing) => {
      avatar?.setSpeaking(playing);
      if (ui.status.dataset.state === "live" || ui.status.dataset.state === "speaking") setStatus(playing ? "speaking" : "live");
    };
    const glow = () => {
      avatar?.setLevel(player?.level() ?? 0);
      levelHandle = requestAnimationFrame(glow);
    };
    glow();

    if (!textOnlyMode) {
      setStatus("mic");
      mic = new Mic();
      try {
        await mic.start((chunk) => client?.sendAudio(chunk.pcm));
      } catch (err) {
        mic.stop();
        mic = undefined;
        const name = (err as DOMException).name;
        const blocked = name === "NotAllowedError" || name === "SecurityError" || micBlockedByPolicy();
        teardown();
        setStatus("idle");
        showError(
          blocked
            ? inFrame
              ? "הדפדפן חוסם את המיקרופון בתוך המסגרת. אפשר לפתוח את השיחה בחלון חדש, או להמשיך בכתיבה."
              : "אין הרשאה למיקרופון. אפשר לאשר אותה בהגדרות הדפדפן, או להמשיך בכתיבה."
            : "לא נמצא מיקרופון. אפשר לחבר מיקרופון, או להמשיך בכתיבה.",
          { openWindow: blocked && inFrame, textOnly: true },
        );
        return;
      }
    }

    void search.load().catch(() => {}); // טוען את המאגר ברקע, לפני השאלה הראשונה
    void bank?.load().catch(() => {});

    client = new LiveClient({
      characterId: c!.id,
      apiBase: "",
      search: (q) => search.search(q),
      quiz: bank && ((args) => bank.pick(args)),
      onEvent,
    });
    try {
      setStatus("connecting");
      const token = await turnstile.take();
      const info = await client.start(token);
      maxMinutes = info.maxSessionMinutes;
      startTimer(info.startedAt);
      ui.prestart.hidden = true;
      ui.controls.hidden = false;
      ui.typeForm.hidden = false;
      ui.samples.hidden = false;
      ui.mute.hidden = textOnlyMode;
    } catch (err) {
      teardown();
      setStatus("idle");
      showError(err instanceof ApiError ? err.message : "בדיקת האבטחה לא הושלמה. רענן את הדף ונסה שוב.");
    }
  }

  ui.start.addEventListener("click", () => void start());
  ui.textOnly.addEventListener("click", () => {
    textOnlyMode = true;
    clearError();
    void start();
  });
  ui.end.addEventListener("click", () => client?.close());
  ui.mute.addEventListener("click", () => {
    if (!mic) return;
    mic.muted = !mic.muted;
    ui.mute.setAttribute("aria-pressed", String(mic.muted));
    ui.mute.textContent = mic.muted ? "הפעל מיקרופון" : "השתק מיקרופון";
  });
  ui.typeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = ui.typeInput.value.trim();
    if (!text || !client) return;
    client.sendText(text);
    currentLine = undefined;
    addTranscript("user", text, c.nameHe);
    currentLine = undefined;
    ui.typeInput.value = "";
  });
  window.addEventListener("pagehide", () => client?.close());
}

if (embed) document.querySelector(".topbar")?.remove();
main().catch(() => showError("לא הצלחנו לטעון את הדמות. רענן את הדף."));
