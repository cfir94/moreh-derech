// הקלטה מהמיקרופון: getUserMedia עם ביטול הד, דיכוי רעשים ובקרת עוצמה, ו-AudioWorklet
// שמחזיר מנות PCM16 ב-16kHz.

import workletUrl from "./mic-worklet.ts?worker&url";

export interface MicChunk {
  pcm: ArrayBuffer;
  rms: number;
}

export class Mic {
  private ctx?: AudioContext;
  private stream?: MediaStream;
  private node?: AudioWorkletNode;
  muted = false;

  /** חייב להיקרא מתוך לחיצה (מדיניות autoplay בדפדפנים). */
  async start(onChunk: (c: MicChunk) => void): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
    });
    this.ctx = new AudioContext();
    await this.ctx.audioWorklet.addModule(workletUrl);
    const source = this.ctx.createMediaStreamSource(this.stream);
    this.node = new AudioWorkletNode(this.ctx, "mic-processor");
    this.node.port.onmessage = (e: MessageEvent<MicChunk>) => {
      if (!this.muted) onChunk(e.data);
    };
    source.connect(this.node);
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  stop(): void {
    this.node?.port.close();
    this.node?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    void this.ctx?.close();
    this.ctx = undefined;
    this.stream = undefined;
    this.node = undefined;
  }
}
