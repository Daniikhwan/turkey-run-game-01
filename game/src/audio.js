// Gobble Dash — all sound is synthesised with WebAudio, no audio files.
// One file, one job: bleeps, thuds and a little bass loop, with a mute switch.
export class SoundBank {
  constructor() {
    this.context = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  unlock() {
    if (!this.context) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
      } catch {
        this.context = null;
      }
    }
    if (this.context && this.context.state === 'suspended') this.context.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopMusic();
    else this.startMusic();
    return this.muted;
  }

  tone(freq, duration, type, volume, slideTo) {
    if (!this.context || this.muted) return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
    gain.gain.setValueAtTime(volume || 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain).connect(this.context.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  noise(duration, volume, lowpass) {
    if (!this.context || this.muted) return;
    const now = this.context.currentTime;
    const length = Math.max(1, Math.floor(this.context.sampleRate * duration));
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass || 1200;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(volume || 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    source.connect(filter).connect(gain).connect(this.context.destination);
    source.start(now);
  }

  jump() { this.tone(320, 0.16, 'square', 0.09, 640); }
  doubleJump() { this.tone(440, 0.14, 'square', 0.09, 880); }
  slide() { this.noise(0.12, 0.08, 900); }
  corn() { this.tone(880, 0.09, 'sine', 0.12, 1320); }
  feather() { this.tone(660, 0.1, 'sine', 0.12, 990); this.tone(990, 0.14, 'sine', 0.1, 1480); }
  hurt() { this.noise(0.25, 0.2, 700); this.tone(160, 0.3, 'sawtooth', 0.14, 60); }
  alarm() { this.tone(520, 0.12, 'square', 0.07, 520); this.tone(390, 0.12, 'square', 0.07, 390); }
  caught() {
    this.tone(392, 0.22, 'sawtooth', 0.12, 392);
    this.tone(311, 0.22, 'sawtooth', 0.12, 311);
    this.tone(233, 0.5, 'sawtooth', 0.12, 220);
  }
  escaped() {
    [523, 659, 784, 1046].forEach((freq, i) => {
      setTimeout(() => this.tone(freq, 0.22, 'triangle', 0.14), i * 130);
    });
  }
  click() { this.tone(700, 0.05, 'square', 0.07, 700); }

  startMusic() {
    if (!this.context || this.muted || this.musicTimer) return;
    // A cheerful little bassline: C - F - G - F, eighth notes at 132 bpm.
    const bass = [130.8, 130.8, 174.6, 196.0, 174.6, 130.8, 98.0, 116.5];
    this.musicStep = 0;
    this.musicTimer = setInterval(() => {
      if (this.muted || !this.context) return;
      const freq = bass[this.musicStep % bass.length];
      this.musicStep += 1;
      this.tone(freq, 0.2, 'triangle', 0.05);
    }, 227);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}
