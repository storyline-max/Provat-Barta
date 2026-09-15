/**
 * Audio utility helpers for Gemini Live API and Gemini Transcribe
 */

// Convert Float32Array from Web Audio API (16kHz) to 16-bit PCM Little Endian base64 string
export function float32ToPcmBase64(inputData: Float32Array): string {
  const buffer = new ArrayBuffer(inputData.length * 2);
  const view = new DataView(buffer);
  let offset = 0;

  for (let i = 0; i < inputData.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, inputData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true); // little-endian
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert base64-encoded 16-bit PCM Little Endian (24kHz from Live API) to AudioBuffer
export function pcmBase64ToAudioBuffer(
  base64Audio: string,
  audioContext: AudioContext
): AudioBuffer {
  const binaryString = window.atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const dataView = new DataView(bytes.buffer);
  const numSamples = Math.floor(bytes.length / 2);
  const float32 = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    float32[i] = int16 / 32768.0;
  }

  const audioBuffer = audioContext.createBuffer(1, numSamples, 24000);
  audioBuffer.copyToChannel(float32, 0);
  return audioBuffer;
}

// Gapless audio playback scheduler for Live API
export class GaplessAudioQueue {
  private ctx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];

  constructor() {
    // Lazy initialized on first user gesture
  }

  public getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx({ sampleRate: 24000 });
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public enqueueChunk(base64Audio: string) {
    const ctx = this.getContext();
    const audioBuffer = pcmBase64ToAudioBuffer(base64Audio, ctx);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    // Schedule seamlessly right after the previous chunk
    const startTime = Math.max(now, this.nextStartTime);
    source.start(startTime);
    this.nextStartTime = startTime + audioBuffer.duration;

    this.activeSources.push(source);
    source.onended = () => {
      const idx = this.activeSources.indexOf(source);
      if (idx !== -1) this.activeSources.splice(idx, 1);
    };
  }

  public stopAll() {
    this.activeSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // ignore
      }
    });
    this.activeSources = [];
    if (this.ctx) {
      this.nextStartTime = this.ctx.currentTime;
    }
  }

  public close() {
    this.stopAll();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
