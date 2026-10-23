// AudioWorklet: מקבל את המיקרופון בקצב של ההקשר (בדרך כלל 48kHz), מוריד ל-16kHz
// וממיר ל-PCM16. שולח מנות של 32ms (512 דגימות) לחוט הראשי, עם עוצמת הקול (RMS).

declare const sampleRate: number;
declare function registerProcessor(name: string, ctor: unknown): void;
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
}

const TARGET_RATE = 16000;
const CHUNK = 512; // 32ms ב-16kHz

class MicProcessor extends AudioWorkletProcessor {
  private ratio = sampleRate / TARGET_RATE;
  private pos = 0;
  private acc = 0;
  private count = 0;
  private out = new Int16Array(CHUNK);
  private n = 0;
  private sumSq = 0;

  process(inputs: Float32Array[][]): boolean {
    const channel = inputs[0]?.[0];
    if (!channel) return true;
    for (let i = 0; i < channel.length; i++) {
      // מסנן "קופסה": ממוצע של הדגימות בכל חלון — מספיק טוב לדיבור.
      this.acc += channel[i];
      this.count++;
      this.pos += 1;
      if (this.pos >= this.ratio) {
        this.pos -= this.ratio;
        const v = Math.max(-1, Math.min(1, this.acc / this.count));
        this.acc = 0;
        this.count = 0;
        this.sumSq += v * v;
        this.out[this.n++] = v < 0 ? v * 0x8000 : v * 0x7fff;
        if (this.n === CHUNK) {
          const rms = Math.sqrt(this.sumSq / CHUNK);
          this.port.postMessage({ pcm: this.out.buffer, rms }, [this.out.buffer]);
          this.out = new Int16Array(CHUNK);
          this.n = 0;
          this.sumSq = 0;
        }
      }
    }
    return true;
  }
}

registerProcessor("mic-processor", MicProcessor);
