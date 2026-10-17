/**
 * Web Audio API synthesizer for realistic supermarket register and POS sound effects.
 * 100% self-contained without external audio assets.
 */

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  /**
   * Iconic supermarket laser barcode scanner beep (crisp high pitch ~1760Hz)
   */
  public playScannerBeep() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, ctx.currentTime); // A6 note
    osc.frequency.exponentialRampToValueAtTime(1840, ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.28, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  /**
   * Register keypad mechanical click
   */
  public playKeyClick() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  }

  /**
   * Produce scale weighing bell / ding
   */
  public playScaleDing() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6 bell tone

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  }

  /**
   * Contactless NFC Tap 2-step beep
   */
  public playCardTap() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.51, ctx.currentTime); // E6
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.08);

    // Second chime 90ms later
    setTimeout(() => {
      const c = this.getContext();
      if (!c) return;
      const osc2 = c.createOscillator();
      const gain2 = c.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760, c.currentTime); // A6
      gain2.gain.setValueAtTime(0.22, c.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);

      osc2.connect(gain2);
      gain2.connect(c.destination);
      osc2.start();
      osc2.stop(c.currentTime + 0.12);
    }, 90);
  }

  /**
   * Card Approved 4-tone triumphant chime (C5 -> E5 -> G5 -> C6)
   */
  public playCardApproved() {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const c = this.getContext();
        if (!c) return;
        const osc = c.createOscillator();
        const gain = c.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, c.currentTime);

        gain.gain.setValueAtTime(0.25, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22);

        osc.connect(gain);
        gain.connect(c.destination);

        osc.start();
        osc.stop(c.currentTime + 0.22);
      }, i * 90);
    });
  }

  /**
   * Error buzz (low tone for invalid PLU or card declined)
   */
  public playError() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, ctx.currentTime);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  /**
   * Thermal printer paper feed sound (subtle noise churr)
   */
  public playPrinterFeed() {
    const ctx = this.getContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.18;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  }

  /**
   * Cash drawer open spring & ding
   */
  public playCashDrawerDing() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2093, ctx.currentTime); // High C7 bell

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  }
}

export const sounds = new SoundEffectsManager();
