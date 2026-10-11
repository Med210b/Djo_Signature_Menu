/**
 * Procedural Web Audio API Ambient Lounge / Jazz Music Engine.
 * 
 * Generates an authentic, warm, and sophisticated downtempo jazz café soundtrack
 * with zero external audio assets, zero network latency, and seamless infinite looping.
 *
 * Instrumentation:
 * - Vintage Rhodes / Electric Piano: Lush jazz 9th, 11th, and 13th chords with tine ping & tremolo
 * - Upright Acoustic Jazz Bass: Deep, warm resonant walking basslines
 * - Brushed Jazz Drum Kit: Gentle swung ride cymbal taps & brushed snare sweeps
 * - Warm Vinyl & Room Atmosphere: Subtle analog tape warmth and acoustic ambience
 *
 * Web Audio Lookahead Scheduler ensures rock-solid, jitter-free timing without drift.
 */

interface ChordNote {
  freq: number;
  gain: number;
  detune?: number;
}

interface ChordDefinition {
  name: string;
  bassFreq: number;
  rhodesNotes: number[]; // Frequencies in Hz
}

export class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.4; // Default 40% volume (subtle background level)
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private schedulerTimer: number | null = null;

  // Tempo and timing
  private tempo: number = 70; // 70 BPM - relaxing downtempo jazz lounge
  private nextBeatTime: number = 0;
  private currentBeat: number = 0;
  private totalBeatsInProgression: number = 32; // 8 measures of 4/4 = 32 beats

  // 8-Measure Sophisticated Jazz Lounge Chord Progression:
  // 1. Dm9 -> 2. G13 -> 3. Cmaj9 -> 4. Am9 -> 5. Fmaj9#11 -> 6. Em9 -> 7. Dm9 -> 8. G7(alt)/G9sus4
  private readonly chords: ChordDefinition[] = [
    // Measure 1: Dm9
    {
      name: 'Dm9',
      bassFreq: 73.42, // D2
      rhodesNotes: [146.83, 174.61, 220.00, 261.63, 329.63], // D3, F3, A3, C4, E4
    },
    // Measure 2: G13
    {
      name: 'G13',
      bassFreq: 49.00, // G1
      rhodesNotes: [174.61, 246.94, 329.63, 440.00, 493.88], // F3, B3, E4, A4, B4
    },
    // Measure 3: Cmaj9
    {
      name: 'Cmaj9',
      bassFreq: 65.41, // C2
      rhodesNotes: [164.81, 196.00, 246.94, 293.66, 392.00], // E3, G3, B3, D4, G4
    },
    // Measure 4: Am9
    {
      name: 'Am9',
      bassFreq: 55.00, // A1
      rhodesNotes: [174.61, 220.00, 261.63, 329.63, 392.00], // F3, A3, C4, E4, G4
    },
    // Measure 5: Fmaj9(#11)
    {
      name: 'Fmaj9#11',
      bassFreq: 43.65, // F1
      rhodesNotes: [174.61, 220.00, 246.94, 329.63, 392.00], // F3, A3, B3, E4, G4
    },
    // Measure 6: Em9
    {
      name: 'Em9',
      bassFreq: 82.41, // E2
      rhodesNotes: [164.81, 196.00, 246.94, 293.66, 370.00], // E3, G3, B3, D4, F#4
    },
    // Measure 7: Dm9
    {
      name: 'Dm9',
      bassFreq: 73.42, // D2
      rhodesNotes: [146.83, 174.61, 220.00, 261.63, 329.63], // D3, F3, A3, C4, E4
    },
    // Measure 8: G9sus4
    {
      name: 'G9sus4',
      bassFreq: 49.00, // G1
      rhodesNotes: [174.61, 220.00, 261.63, 293.66, 440.00], // F3, A3, C4, D4, A4
    },
  ];

  // Reusable noise buffer for brushes and vinyl atmosphere
  private vinylBuffer: AudioBuffer | null = null;
  private brushNoiseBuffer: AudioBuffer | null = null;

  constructor() {
    // Auto-unlock audio context on first user interaction anywhere in the window
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

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        // Master gain node
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.45, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Precompute noise buffers
        this.vinylBuffer = this.createVinylNoiseBuffer(this.ctx);
        this.brushNoiseBuffer = this.createBrushNoiseBuffer(this.ctx);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Generates warm vinyl and subtle room texture
   */
  private createVinylNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const duration = 4.0;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.992 * b0 + white * 0.08;
      b1 = 0.985 * b1 + b0 * 0.2;
      // Gentle vinyl crackle pops
      const crackle = Math.random() < 0.0007 ? (Math.random() * 0.12 - 0.06) : 0;
      data[i] = (b1 * 0.08 + crackle) * 0.25;
    }
    return buffer;
  }

  /**
   * Generates fibrous noise for brushed snare and jazz ride cymbals
   */
  private createBrushNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const duration = 0.8;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    return buffer;
  }

  /**
   * Plays a warm Rhodes electric piano chord note with tine ping & lush decay
   */
  private playRhodesNote(freq: number, time: number, duration: number, velocity: number = 0.6) {
    if (!this.ctx || !this.masterGain) return;

    try {
      // 1. Fundamental warmth (Sine wave)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, time);

      // 2. Harmonic body (Gentle mellow triangle)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq, time);
      osc2.detune.setValueAtTime(2.5, time); // Subtle rich chorus

      // 3. Tine Bell Ping (Slight metallic chime in attack)
      const tineOsc = this.ctx.createOscillator();
      tineOsc.type = 'sine';
      tineOsc.frequency.setValueAtTime(freq * 3.98, time);

      // Filter for vintage warm electric piano timbre
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, time);
      filter.frequency.exponentialRampToValueAtTime(700, time + duration);

      // Tine envelope (Quick 90ms decay)
      const tineGain = this.ctx.createGain();
      tineGain.gain.setValueAtTime(0.0001, time);
      tineGain.gain.linearRampToValueAtTime(velocity * 0.06, time + 0.008);
      tineGain.gain.exponentialRampToValueAtTime(0.00001, time + 0.09);
      tineOsc.connect(tineGain);
      tineGain.connect(filter);

      // Main Note Envelope
      const noteGain = this.ctx.createGain();
      noteGain.gain.setValueAtTime(0.0001, time);
      // Soft touch attack (25ms)
      noteGain.gain.linearRampToValueAtTime(velocity * 0.11, time + 0.025);
      // Smooth natural piano decay
      noteGain.gain.exponentialRampToValueAtTime(velocity * 0.04, time + 0.6);
      noteGain.gain.exponentialRampToValueAtTime(0.00001, time + duration);

      osc1.connect(noteGain);
      osc2.connect(noteGain);
      noteGain.connect(filter);
      filter.connect(this.masterGain);

      osc1.start(time);
      osc2.start(time);
      tineOsc.start(time);

      osc1.stop(time + duration);
      osc2.stop(time + duration);
      tineOsc.stop(time + 0.12);
    } catch {
      // Ignore audio glitches safely
    }
  }

  /**
   * Plays an upright jazz bass note with warm round tone and acoustic slide
   */
  private playUprightBassNote(freq: number, time: number, duration: number, velocity: number = 0.7) {
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      // Add gentle sub-harmonic overtone
      const overtone = this.ctx.createOscillator();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2, time);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, time);
      filter.frequency.exponentialRampToValueAtTime(140, time + duration);

      const bassGain = this.ctx.createGain();
      bassGain.gain.setValueAtTime(0.0001, time);
      // Finger pluck attack (20ms)
      bassGain.gain.linearRampToValueAtTime(velocity * 0.22, time + 0.02);
      bassGain.gain.exponentialRampToValueAtTime(velocity * 0.09, time + 0.4);
      bassGain.gain.exponentialRampToValueAtTime(0.00001, time + duration);

      const overtoneGain = this.ctx.createGain();
      overtoneGain.gain.setValueAtTime(velocity * 0.035, time);
      overtoneGain.gain.exponentialRampToValueAtTime(0.00001, time + duration * 0.6);

      osc.connect(bassGain);
      overtone.connect(overtoneGain);
      overtoneGain.connect(bassGain);
      bassGain.connect(filter);
      filter.connect(this.masterGain);

      osc.start(time);
      overtone.start(time);
      osc.stop(time + duration);
      overtone.stop(time + duration);
    } catch {
      // Ignore
    }
  }

  /**
   * Plays a delicate jazz ride cymbal tap with swing feel
   */
  private playRideCymbal(time: number, velocity: number = 0.3) {
    if (!this.ctx || !this.masterGain || !this.brushNoiseBuffer) return;

    try {
      const source = this.ctx.createBufferSource();
      source.buffer = this.brushNoiseBuffer;

      // Bandpass for golden shimmer
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(8200, time);
      filter.Q.setValueAtTime(3.5, time);

      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(6500, time);

      const cymbalGain = this.ctx.createGain();
      cymbalGain.gain.setValueAtTime(0.0001, time);
      cymbalGain.gain.linearRampToValueAtTime(velocity * 0.045, time + 0.006);
      cymbalGain.gain.exponentialRampToValueAtTime(0.00001, time + 0.28);

      source.connect(highpass);
      highpass.connect(filter);
      filter.connect(cymbalGain);
      cymbalGain.connect(this.masterGain);

      source.start(time);
      source.stop(time + 0.3);
    } catch {
      // Ignore
    }
  }

  /**
   * Plays a gentle brushed snare swoosh on beats 2 and 4
   */
  private playBrushSnare(time: number, velocity: number = 0.35) {
    if (!this.ctx || !this.masterGain || !this.brushNoiseBuffer) return;

    try {
      const source = this.ctx.createBufferSource();
      source.buffer = this.brushNoiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, time);
      filter.Q.setValueAtTime(1.2, time);

      const snareGain = this.ctx.createGain();
      snareGain.gain.setValueAtTime(0.0001, time);
      snareGain.gain.linearRampToValueAtTime(velocity * 0.038, time + 0.04);
      snareGain.gain.exponentialRampToValueAtTime(0.00001, time + 0.32);

      source.connect(filter);
      filter.connect(snareGain);
      snareGain.connect(this.masterGain);

      source.start(time);
      source.stop(time + 0.34);
    } catch {
      // Ignore
    }
  }

  /**
   * Schedules events in the current lookahead window
   */
  private scheduleBeat(beat: number, time: number, beatDuration: number) {
    const measureIndex = Math.floor(beat / 4) % this.chords.length;
    const chord = this.chords[measureIndex];
    const beatInMeasure = beat % 4; // 0, 1, 2, 3

    // 1. Rhodes Chord Comping
    // Downbeat of measure (beat 0) - full lush chord with slight humanized strum
    if (beatInMeasure === 0) {
      chord.rhodesNotes.forEach((freq, idx) => {
        // Humanized arpeggiated spread (25ms stagger across chord)
        const noteTime = time + idx * 0.022;
        this.playRhodesNote(freq, noteTime, beatDuration * 3.4, 0.55);
      });
    } else if (beatInMeasure === 2) {
      // Gentle syncopated accompaniment on beat 3
      chord.rhodesNotes.slice(1, 4).forEach((freq, idx) => {
        const noteTime = time + idx * 0.018;
        this.playRhodesNote(freq, noteTime, beatDuration * 1.8, 0.42);
      });
    } else if (beatInMeasure === 3) {
      // Soft upbeat ghost chord on the swing eighth note
      const swingTime = time + beatDuration * 0.66;
      chord.rhodesNotes.slice(2).forEach((freq, idx) => {
        this.playRhodesNote(freq, swingTime + idx * 0.015, beatDuration * 1.2, 0.35);
      });
    }

    // 2. Upright Bass
    if (beatInMeasure === 0) {
      // Root on beat 1
      this.playUprightBassNote(chord.bassFreq, time, beatDuration * 1.8, 0.68);
    } else if (beatInMeasure === 2) {
      // Fifth or walking transition note on beat 3
      const fifth = chord.bassFreq * 1.498;
      this.playUprightBassNote(fifth, time, beatDuration * 1.4, 0.58);
    } else if (beatInMeasure === 3) {
      // Walking approach note on swing beat 4.66
      const swingTime = time + beatDuration * 0.66;
      const approachNote = chord.bassFreq * 1.122; // whole step approach
      this.playUprightBassNote(approachNote, swingTime, beatDuration * 0.8, 0.45);
    }

    // 3. Swung Brushed Drums
    // Ride tap on each beat
    this.playRideCymbal(time, 0.28);
    // Swung triplet eighth note tap: "ding-da-DING-da"
    const swingEighth = time + beatDuration * 0.66;
    this.playRideCymbal(swingEighth, 0.22);

    // Brushed snare sweep on backbeats 2 and 4
    if (beatInMeasure === 1 || beatInMeasure === 3) {
      this.playBrushSnare(time, 0.36);
    }
  }

  /**
   * Main Web Audio lookahead loop
   */
  private scheduler = () => {
    if (!this.ctx || !this.isPlaying) return;

    const lookaheadTime = 0.25; // 250ms lookahead
    const beatDuration = 60 / this.tempo; // Duration of one beat in seconds (~0.857s)

    while (this.nextBeatTime < this.ctx.currentTime + lookaheadTime) {
      this.scheduleBeat(this.currentBeat, this.nextBeatTime, beatDuration);
      this.nextBeatTime += beatDuration;
      this.currentBeat = (this.currentBeat + 1) % this.totalBeatsInProgression;
    }

    this.schedulerTimer = window.setTimeout(this.scheduler, 80);
  };

  /**
   * Starts ambient jazz background playback
   */
  public start() {
    if (this.isPlaying) return;

    const ctx = this.initContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    this.isPlaying = true;
    this.nextBeatTime = ctx.currentTime + 0.1;
    this.currentBeat = 0;

    // Smooth fade-in
    if (this.masterGain) {
      const targetGain = this.isMuted ? 0 : this.volume * 0.45;
      this.masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.8);
    }

    this.scheduler();
  }

  /**
   * Pauses ambient jazz background playback
   */
  public stop() {
    if (!this.isPlaying) return;

    if (this.schedulerTimer) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    if (this.ctx && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
    }

    this.isPlaying = false;
  }

  /**
   * Updates mute state and adjusts gain smoothly
   */
  public setMuted(muted: boolean) {
    this.isMuted = muted;

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      if (muted) {
        // Quick smooth fade to silence
        this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
      } else {
        // Smooth un-mute ramp
        const targetGain = this.volume * 0.45;
        this.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.25);
        if (!this.isPlaying) {
          this.start();
        }
      }
    }
  }

  /**
   * Sets music volume (0.0 to 1.0) with smooth ramp
   */
  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      if (!this.isMuted) {
        const targetGain = this.volume * 0.45;
        this.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.08);
      }
    }

    // Auto-start playback on volume interaction if not already playing and not muted
    if (this.volume > 0 && !this.isPlaying && !this.isMuted) {
      this.start();
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

// Global ambient background music instance
export const ambientAudio = new AmbientAudioEngine();
