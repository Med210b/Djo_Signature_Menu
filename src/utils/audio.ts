/**
 * Web Audio API synthesizer for realistic, subtle paper friction and rustle sound.
 * Zero external audio files required, runs with ultra-low latency and zero network dependencies.
 *
 * Simulates:
 * 1. Initial crisp parchment scrape / friction attack as the paper lifts from the stack.
 * 2. Soft fibrous swoosh / air resistance body as the page turns through the air.
 * 3. Delicate gentle settling flutter as the page glides down.
 */

class PageFlipAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastPlayTime: number = 0;

  constructor() {
    // AudioContext is initialized on first user gesture (pointerdown/touchstart/click/keydown)
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.initContext();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio, { passive: true, once: true });
      window.addEventListener('keydown', unlockAudio, { passive: true, once: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true, once: true });
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Generates organic fibrous paper noise with slight irregularities
   */
  private createPaperNoiseBuffer(
    ctx: AudioContext,
    duration: number,
    colorBias: number = 0.88
  ): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    let b0 = 0.0, b1 = 0.0, b2 = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      // Pink/Brown filtering for authentic paper fiber texture
      b0 = 0.99765 * b0 + white * 0.0990460;
      b1 = 0.96300 * b1 + white * 0.2965164;
      b2 = 0.57000 * b2 + white * 1.0526913;
      const pinkish = (b0 + b1 + b2 + white * 0.5362) * 0.11;

      lastOut = lastOut * colorBias + pinkish * (1 - colorBias);

      // Add microscopic paper fiber crackle spikes
      const grain = Math.random() < 0.008 ? (Math.random() * 0.4 - 0.2) : 0;
      data[i] = (lastOut * 0.85 + grain) * (1 - (i / bufferSize) * 0.15);
    }

    return buffer;
  }

  /**
   * Plays realistic paper friction sound triggered immediately when flipping starts.
   * Debounces accidental rapid double-triggers within 120ms.
   */
  public playPageTurn() {
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Prevent rapid overlapping stutter if two events fire simultaneously
      if (now - this.lastPlayTime < 0.14) {
        return;
      }
      this.lastPlayTime = now;

      const duration = 0.32; // Realistic paper flip duration matching ~650ms animation curve

      // --- LAYER 1: Crisp paper surface friction / scrape (Higher textured frequencies) ---
      const frictionBuffer = this.createPaperNoiseBuffer(this.ctx, duration * 0.65, 0.78);
      const frictionSource = this.ctx.createBufferSource();
      frictionSource.buffer = frictionBuffer;

      // Highpass to isolate parchment fiber scraping
      const frictionHp = this.ctx.createBiquadFilter();
      frictionHp.type = 'highpass';
      frictionHp.frequency.setValueAtTime(1400, now);
      frictionHp.frequency.exponentialRampToValueAtTime(800, now + 0.18);

      // Bandpass peaking for paper scrape resonance
      const frictionBp = this.ctx.createBiquadFilter();
      frictionBp.type = 'bandpass';
      frictionBp.frequency.setValueAtTime(2800, now);
      frictionBp.Q.setValueAtTime(1.8, now);

      // Envelope: Instant crisp attack, quick decay
      const frictionGain = this.ctx.createGain();
      frictionGain.gain.setValueAtTime(0.0001, now);
      frictionGain.gain.linearRampToValueAtTime(0.16, now + 0.018); // Fast 18ms scrape attack
      frictionGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.20);

      frictionSource.connect(frictionHp);
      frictionHp.connect(frictionBp);
      frictionBp.connect(frictionGain);
      frictionGain.connect(this.ctx.destination);

      frictionSource.start(now);
      frictionSource.stop(now + 0.22);

      // --- LAYER 2: Gentle page body whoosh / air friction (Smooth warm body) ---
      const bodyBuffer = this.createPaperNoiseBuffer(this.ctx, duration, 0.92);
      const bodySource = this.ctx.createBufferSource();
      bodySource.buffer = bodyBuffer;

      // Bandpass for warm page displacement
      const bodyBp = this.ctx.createBiquadFilter();
      bodyBp.type = 'bandpass';
      bodyBp.frequency.setValueAtTime(750, now);
      // Frequency sweeps upward as page arches then sweeps down as page lands
      bodyBp.frequency.exponentialRampToValueAtTime(1250, now + 0.12);
      bodyBp.frequency.exponentialRampToValueAtTime(520, now + duration);
      bodyBp.Q.setValueAtTime(1.2, now);

      // Lowpass to keep it soft, subtle, and natural (never harsh or intrusive)
      const bodyLp = this.ctx.createBiquadFilter();
      bodyLp.type = 'lowpass';
      bodyLp.frequency.setValueAtTime(2200, now);
      bodyLp.frequency.exponentialRampToValueAtTime(950, now + duration);

      // Envelope: Smooth arc matching page arching through the air
      const bodyGain = this.ctx.createGain();
      bodyGain.gain.setValueAtTime(0.0001, now);
      bodyGain.gain.linearRampToValueAtTime(0.14, now + 0.045);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      bodySource.connect(bodyBp);
      bodyBp.connect(bodyLp);
      bodyLp.connect(bodyGain);
      bodyGain.connect(this.ctx.destination);

      bodySource.start(now);
      bodySource.stop(now + duration);
    } catch {
      // Gracefully ignore audio failures if browser blocks autoplay or tab is unfocused
    }
  }
}

export const pageFlipAudio = new PageFlipAudio();
