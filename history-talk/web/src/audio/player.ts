// תור השמעה ל-PCM16 ב-24kHz. כל מנה מתוזמנת מיד אחרי הקודמת, עם מאגר של 150ms
// בתחילת כל רצף כדי למנוע קטיעות. בהפרעה (interrupted) — עצירה וריקון מיידיים.

const RATE = 24000;
const START_BUFFER = 0.15;

export class Player {
  private ctx: AudioContext;
  private analyser: AnalyserNode;
  private sources = new Set<AudioBufferSourceNode>();
  private nextTime = 0;
  private levelData: Uint8Array<ArrayBuffer>;
  onPlayingChange?: (playing: boolean) => void;

  /** חייב להיקרא מתוך לחיצה. */
  constructor() {
    this.ctx = new AudioContext({ sampleRate: RATE });
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.levelData = new Uint8Array(new ArrayBuffer(this.analyser.fftSize));
    this.analyser.connect(this.ctx.destination);
  }

  async resume(): Promise<void> {
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  get playing(): boolean {
    return this.sources.size > 0;
  }

  enqueue(pcm16: Int16Array): void {
    if (!pcm16.length) return;
    const buffer = this.ctx.createBuffer(1, pcm16.length, RATE);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < pcm16.length; i++) data[i] = pcm16[i] / 0x8000;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.analyser);
    const now = this.ctx.currentTime;
    if (this.nextTime < now) this.nextTime = now + START_BUFFER;
    src.start(this.nextTime);
    this.nextTime += buffer.duration;
    const wasPlaying = this.playing;
    this.sources.add(src);
    if (!wasPlaying) this.onPlayingChange?.(true);
    src.onended = () => {
      this.sources.delete(src);
      if (!this.playing) this.onPlayingChange?.(false);
    };
  }

  /** עוצמת ההשמעה כרגע, 0–1 (לזוהר של הדמות). */
  level(): number {
    if (!this.playing) return 0;
    this.analyser.getByteTimeDomainData(this.levelData);
    let sum = 0;
    for (const v of this.levelData) sum += ((v - 128) / 128) ** 2;
    return Math.min(1, Math.sqrt(sum / this.levelData.length) * 3);
  }

  /** הפרעה: עוצרים הכול מיד ומרוקנים את התור. */
  interrupt(): void {
    for (const src of this.sources) {
      src.onended = null;
      try {
        src.stop();
      } catch {
        /* כבר נעצר */
      }
    }
    const wasPlaying = this.playing;
    this.sources.clear();
    this.nextTime = 0;
    if (wasPlaying) this.onPlayingChange?.(false);
  }

  close(): void {
    this.interrupt();
    void this.ctx.close();
  }
}
