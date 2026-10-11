/**
 * Procedural Web Audio API Ambient Lounge / Jazz Music Engine.
 */

interface ChordNote {
  freq: number;
  gain: number;
  detune?: number;
}

interface ChordDefinition {
  name: string;
  bassFreq: number;
  rhodesNotes: number[]; 
}

export class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.4; 
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private schedulerTimer: number | null = null;

  private tempo: number = 70; 
  private nextBeatTime: number = 0;
  private currentBeat: number = 0;
  private totalBeatsInProgression: number = 32; 

  private readonly chords: ChordDefinition[] = [
    { name: 'Dm9', bassFreq: 73.42, rhodesNotes: [146.83, 174.61, 220.00, 261.63, 329.63] },
    { name: 'G13', bassFreq: 49.00, rhodesNotes: [174.61, 246.94, 329.63, 440.00, 493.88] },
    { name: 'Cmaj9', bassFreq: 65.41, rhodesNotes: [164.81, 196.00, 246.94, 293.66, 392.00] },
    { name: 'Am9', bassFreq: 55.00, rhodesNotes: [174.61, 220.00, 261.63, 329.63, 392.00] },
    { name: 'Fmaj9#11', bassFreq: 43.65, rhodesNotes: [174.61, 220.00, 246.94, 329.63, 392.00] },
    { name: 'Em9', bassFreq: 82.41, rhodesNotes: [164.81, 196.00, 246.94, 293.66, 370.00] },
    { name: 'Dm9', bassFreq: 73.42, rhodesNotes: [146.83, 174.61, 220.00, 261.63, 329.63] },
    { name: 'G9sus4', bassFreq: 49.00, rhodesNotes: [174.61, 220.00, 261.63, 293.66, 440.00] },
  ];

  private vinylBuffer: AudioBuffer | null = null;
  private brushNoiseBuffer: AudioBuffer | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        const ctx = this.initContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      };
      
      window.addEventListener('pointerdown', unlockAudio, { passive: true, once: true, capture: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true, once: true, capture: true });
      window.addEventListener('click', unlockAudio, { passive: true, once: true, capture: true });
    }
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        // DIRECT ASSIGNMENT - Bypasses Android Chrome ramp bug
        this.masterGain.gain.value = this.isMuted ? 0 : this.volume * 0.45;
        this.masterGain.connect(this.ctx.destination);

        this.vinylBuffer = this.createVinylNoiseBuffer(this.ctx);
        this.brushNoiseBuffer = this.createBrushNoiseBuffer(this.ctx);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

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
      const crackle = Math.random() < 0.0007 ? (Math.random() * 0.12 - 0.06) : 0;
      data[i] = (b1 * 0.08 + crackle) * 0.25;
    }
    return buffer;
  }

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

  private playRhodesNote(freq: number, time: number, duration: number, velocity: number = 0.6) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = freq;

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = freq;
      osc2.detune.value = 2.5;

      const tineOsc = this.ctx.createOscillator();
      tineOsc.type = 'sine';
      tineOsc.frequency.value = freq * 3.98;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, time);
      filter.frequency.exponentialRampToValueAtTime(700, time + duration);

      const tineGain = this.ctx.createGain();
      tineGain.gain.setValueAtTime(0.0001, time);
      tineGain.gain.linearRampToValueAtTime(velocity * 0.06, time + 0.008);
      tineGain.gain.exponentialRampToValueAtTime(0.00001, time + 0.09);
      tineOsc.connect(tineGain);
      tineGain.connect(filter);

      const noteGain = this.ctx.createGain();
      noteGain.gain.setValueAtTime(0.0001, time);
      noteGain.gain.linearRampToValueAtTime(velocity * 0.11, time + 0.025);
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
    } catch {}
  }

  private playUprightBassNote(freq: number, time: number, duration: number, velocity: number = 0.7) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const overtone = this.ctx.createOscillator();
      overtone.type = 'triangle';
      overtone.frequency.value = freq * 2;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, time);
      filter.frequency.exponentialRampToValueAtTime(140, time + duration);

      const bassGain = this.ctx.createGain();
      bassGain.gain.setValueAtTime(0.0001, time);
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
    } catch {}
  }

  private playRideCymbal(time: number, velocity: number = 0.3) {
    if (!this.ctx || !this.masterGain || !this.brushNoiseBuffer) return;
    try {
      const source = this.ctx.createBufferSource();
      source.buffer = this.brushNoiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 8200;
      filter.Q.value = 3.5;

      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 6500;

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
    } catch {}
  }

  private playBrushSnare(time: number, velocity: number = 0.35) {
    if (!this.ctx || !this.masterGain || !this.brushNoiseBuffer) return;
    try {
      const source = this.ctx.createBufferSource();
      source.buffer = this.brushNoiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 1.2;

      const snareGain = this.ctx.createGain();
      snareGain.gain.setValueAtTime(0.0001, time);
      snareGain.gain.linearRampToValueAtTime(velocity * 0.038, time + 0.04);
      snareGain.gain.exponentialRampToValueAtTime(0.00001, time + 0.32);

      source.connect(filter);
      filter.connect(snareGain);
      snareGain.connect(this.masterGain);

      source.start(time);
      source.stop(time + 0.34);
    } catch {}
  }

  private scheduleBeat(beat: number, time: number, beatDuration: number) {
    const measureIndex = Math.floor(beat / 4) % this.chords.length;
    const chord = this.chords[measureIndex];
    const beatInMeasure = beat % 4;

    if (beatInMeasure === 0) {
      chord.rhodesNotes.forEach((freq, idx) => {
        this.playRhodesNote(freq, time + idx * 0.022, beatDuration * 3.4, 0.55);
      });
    } else if (beatInMeasure === 2) {
      chord.rhodesNotes.slice(1, 4).forEach((freq, idx) => {
        this.playRhodesNote(freq, time + idx * 0.018, beatDuration * 1.8, 0.42);
      });
    } else if (beatInMeasure === 3) {
      const swingTime = time + beatDuration * 0.66;
      chord.rhodesNotes.slice(2).forEach((freq, idx) => {
        this.playRhodesNote(freq, swingTime + idx * 0.015, beatDuration * 1.2, 0.35);
      });
    }

    if (beatInMeasure === 0) {
      this.playUprightBassNote(chord.bassFreq, time, beatDuration * 1.8, 0.68);
    } else if (beatInMeasure === 2) {
      this.playUprightBassNote(chord.bassFreq * 1.498, time, beatDuration * 1.4, 0.58);
    } else if (beatInMeasure === 3) {
      this.playUprightBassNote(chord.bassFreq * 1.122, time + beatDuration * 0.66, beatDuration * 0.8, 0.45);
    }

    this.playRideCymbal(time, 0.28);
    this.playRideCymbal(time + beatDuration * 0.66, 0.22);
    if (beatInMeasure === 1 || beatInMeasure === 3) {
      this.playBrushSnare(time, 0.36);
    }
  }

  private scheduler = () => {
    if (!this.ctx || !this.isPlaying) return;
    const lookaheadTime = 0.25;
    const beatDuration = 60 / this.tempo;
    while (this.nextBeatTime < this.ctx.currentTime + lookaheadTime) {
      this.scheduleBeat(this.currentBeat, this.nextBeatTime, beatDuration);
      this.nextBeatTime += beatDuration;
      this.currentBeat = (this.currentBeat + 1) % this.totalBeatsInProgression;
    }
    this.schedulerTimer = window.setTimeout(this.scheduler, 80);
  };

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

    if (this.masterGain) {
      // DIRECT ASSIGNMENT - Forces audio to play immediately
      this.masterGain.gain.cancelScheduledValues(ctx.currentTime);
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume * 0.45;
    }
    this.scheduler();
  }

  public stop() {
    if (!this.isPlaying) return;
    if (this.schedulerTimer) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    if (this.masterGain) {
      this.masterGain.gain.value = 0; // Direct cut
    }
    this.isPlaying = false;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(this.ctx?.currentTime || 0);
      this.masterGain.gain.value = muted ? 0 : this.volume * 0.45;
    }
    if (!muted && !this.isPlaying) {
      this.start();
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(this.ctx?.currentTime || 0);
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume * 0.45;
    }
    if (this.volume > 0 && !this.isPlaying && !this.isMuted) {
      this.start();
    }
  }

  public getVolume(): number { return this.volume; }
  public getIsPlaying(): boolean { return this.isPlaying; }
  public getIsMuted(): boolean { return this.isMuted; }
}

export const ambientAudio = new AmbientAudioEngine();