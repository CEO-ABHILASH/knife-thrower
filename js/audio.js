/**
 * Procedural Web Audio API Sound Synthesizer
 * Zero external audio files required. Latency-free and responsive.
 */
class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('knife_thrower_muted') === 'true';
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.initialized = true;
      }
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  resume() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('knife_thrower_muted', this.muted);
    return this.muted;
  }

  // --- SOUND EFFECTS ---

  playThrow() {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  playWoodImpact(combo = 0) {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    // Pitch shift up based on combo streak
    const pitchMultiplier = Math.pow(1.06, Math.min(combo, 10));

    // Deep resonant wood thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 160 * pitchMultiplier;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(45 * pitchMultiplier, t + 0.09);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);

    // High snap click for knife penetration
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(800 * pitchMultiplier, t);
    snapOsc.frequency.exponentialRampToValueAtTime(120, t + 0.04);

    snapGain.gain.setValueAtTime(0.3, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);

    snapOsc.start(t);
    snapOsc.stop(t + 0.04);
  }

  playMetalRicochet() {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;

    // Dual bell/metallic dissonance
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'square';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(1850, t);
    osc1.frequency.exponentialRampToValueAtTime(600, t + 0.35);

    osc2.frequency.setValueAtTime(2420, t);
    osc2.frequency.exponentialRampToValueAtTime(750, t + 0.35);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.35);
    osc2.stop(t + 0.35);
  }

  playAppleSlice() {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(1800, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  playTargetShatter() {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    // Ascending victory arpeggio: C5, E5, G5, C6
    const freqs = [523.25, 659.25, 783.99, 1046.50];

    freqs.forEach((freq, idx) => {
      const noteTime = t + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.3, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.25);
    });

    // Explosive wood crack rumble
    const rumbleOsc = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    rumbleOsc.type = 'sawtooth';
    rumbleOsc.frequency.setValueAtTime(120, t);
    rumbleOsc.frequency.exponentialRampToValueAtTime(30, t + 0.45);

    rumbleGain.gain.setValueAtTime(0.5, t);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(this.ctx.destination);

    rumbleOsc.start(t);
    rumbleOsc.stop(t + 0.45);
  }

  playClick() {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  }
}

// Global audio instance
window.soundCtrl = new SoundController();
