// Synthesized Web Audio API sound effects for zero-dependency, ultra-fast cyberpunk SFX

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    // Check saved audio preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('albido_audio_enabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('albido_audio_enabled', String(this.enabled));
    }
    if (this.enabled) {
      this.playBeep(880, 0.08, 'sine');
    }
    return this.enabled;
  }

  // Quick cyber blip during decoding
  public playCipherTick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      const freqs = [520, 640, 780, 920, 1040, 1200];
      const freq = freqs[Math.floor(Math.random() * freqs.length)];

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.04);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // AudioContext might be blocked until gesture
    }
  }

  // Heavy cyber reveal impact sound
  public playRevealImpact() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Sub-bass thump
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(160, now);
      sub.frequency.exponentialRampToValueAtTime(38, now + 0.28);
      subGain.gain.setValueAtTime(0.3, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      sub.connect(subGain);
      subGain.connect(this.ctx.destination);
      sub.start(now);
      sub.stop(now + 0.32);

      // Sci-fi high chime
      const high = this.ctx.createOscillator();
      const highGain = this.ctx.createGain();
      high.type = 'sawtooth';
      high.frequency.setValueAtTime(980, now);
      high.frequency.exponentialRampToValueAtTime(1440, now + 0.15);
      highGain.gain.setValueAtTime(0.08, now);
      highGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      high.connect(highGain);
      highGain.connect(this.ctx.destination);
      high.start(now);
      high.stop(now + 0.22);
    } catch {}
  }

  // System unlocked / boot complete harmonic chord
  public playBootSuccess() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880];
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = now + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch {}
  }

  // Simple clean beep
  public playBeep(freq = 600, duration = 0.08, type: OscillatorType = 'sine') {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }
}

export const sound = new SoundManager();
