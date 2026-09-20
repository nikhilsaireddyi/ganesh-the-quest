/**
 * AudioManager - Web Audio API Procedural Synthesizer & Sound System
 * Guarantees rich, responsive audio out-of-the-box with ZERO missing audio files,
 * while supporting real MP3/OGG files when dropped into assets/audio/.
 */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.isMuted = false;
    this.backgroundBells = true;
    this.musicVolume = 0.6;
    this.sfxVolume = 0.8;
    this.currentMusic = null;
    this.musicLoopInterval = null;
    this.activeNodes = new Set();
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  resume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(mute) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(mute ? 0 : 1, this.ctx.currentTime);
    }
  }

  setBackgroundBells(enabled) {
    this.backgroundBells = enabled;
  }

  setVolume(sfx, music) {
    this.sfxVolume = sfx;
    this.musicVolume = music;
    if (this.ctx) {
      if (this.sfxGain) this.sfxGain.gain.setValueAtTime(sfx, this.ctx.currentTime);
      if (this.musicGain) this.musicGain.gain.setValueAtTime(music, this.ctx.currentTime);
    }
  }

  // --- PROCEDURAL SFX GENERATORS ---

  playFootstep() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, t);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80 + Math.random() * 20, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

    gain.gain.setValueAtTime(0.12 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  playSnap() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.06);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  playSuccess() {
    if (!this.ctx || this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  // --- CRISP, SPARKLING ITEM PICKUP CHIME ---
  playPickup(comboIndex = 0) {
    if (!this.ctx || this.isMuted) return;
    this.vibrate([20]);
    const t = this.ctx.currentTime;

    // Bright ascending crystal chime (Glockenspiel / Magic Sparkle Arpeggio)
    // Progressively higher musical chords as items are collected
    const chords = [
      [783.99, 1046.50, 1318.51],  // G5 -> C6 -> E6 (Crisp positive pickup)
      [880.00, 1174.66, 1479.98],  // A5 -> D6 -> F#6
      [987.77, 1318.51, 1661.22],  // B5 -> E6 -> G#6
      [1046.50, 1396.91, 1760.00], // C6 -> F6 -> A6
      [1174.66, 1567.98, 2093.00]  // D6 -> G6 -> C7 (Triumphant final pickup)
    ];
    const safeIdx = Math.max(0, Math.min(Number(comboIndex) || 0, chords.length - 1));
    const notes = chords[safeIdx];

    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.052;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pure clear crystal bell tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.32 * this.sfxVolume, noteTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0005, noteTime + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(noteTime);
      osc.stop(noteTime + 0.28);

      // Shimmering octave harmonic
      const overtone = this.ctx.createOscillator();
      const overGain = this.ctx.createGain();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2, noteTime);

      overGain.gain.setValueAtTime(0.001, noteTime);
      overGain.gain.linearRampToValueAtTime(0.12 * this.sfxVolume, noteTime + 0.008);
      overGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.16);

      overtone.connect(overGain);
      overGain.connect(this.sfxGain);
      overtone.start(noteTime);
      overtone.stop(noteTime + 0.16);
    });

    // Magical item sparkle puff (soft high-pass glitter whoosh)
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.07);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3500, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.14 * this.sfxVolume, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(t);
    } catch (_) {}
  }

  playBell() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    // Temple brass bell with metallic harmonics
    const freqs = [1200, 2400, 3100, 4800];
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const amp = (0.2 / (i + 1)) * this.sfxVolume;
      gain.gain.setValueAtTime(amp, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 1.6);
    });
  }

  playSpark() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1500, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  playThunder() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const dur = 2.2;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.7));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, t);
    filter.frequency.linearRampToValueAtTime(60, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  playDhol() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    // Punchy base bass drum
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);

    gain.gain.setValueAtTime(0.45 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);

    // High treble slap (tasha/dhol stick)
    const tasha = this.ctx.createOscillator();
    const tashaGain = this.ctx.createGain();
    tasha.type = 'square';
    tasha.frequency.setValueAtTime(420, t);
    tasha.frequency.exponentialRampToValueAtTime(100, t + 0.05);

    tashaGain.gain.setValueAtTime(0.18 * this.sfxVolume, t);
    tashaGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    tasha.connect(tashaGain);
    tashaGain.connect(this.sfxGain);

    tasha.start(t);
    tasha.stop(t + 0.06);
  }

  playFirework() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    // Pop + sparkle crackle
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.2);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  playWaterRipple() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(500 + Math.random() * 100, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.15);

    gain.gain.setValueAtTime(0.15 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // --- PROCEDURAL BACKGROUND MUSIC THEMES ---
  // Themes: 'CALM', 'FESTIVAL', 'STORM', 'PROCESSION', 'VISARJAN'

  playMusicTheme(theme) {
    if (this.currentMusic === theme) return;
    this.stopMusic();
    this.currentMusic = theme;
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    let step = 0;
    const bpm = theme === 'PROCESSION' ? 128 : (theme === 'FESTIVAL' ? 112 : 75);
    const intervalMs = (60 / bpm) * 500; // 8th note tick

    // Indian scales (Raga Bhupali / Shankara pentatonic: Sa Re Ga Pa Dha: C D E G A)
    const ragBhupali = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    const stormNotes = [130.81, 138.59, 146.83, 164.81];
    const visarjanNotes = [261.63, 329.63, 392.00, 523.25, 659.25];

    this.musicLoopInterval = setInterval(() => {
      if (this.isMuted || !this.ctx || this.ctx.state !== 'running') return;

      const t = this.ctx.currentTime;

      if (theme === 'CALM') {
        // Gentle sitar/tanpura pluck
        if (step % 4 === 0) {
          const freq = ragBhupali[step % ragBhupali.length];
          this.synthesizePluck(freq, 0.14, 0.8, t);
        }
      } else if (theme === 'FESTIVAL') {
        // Serene, uplifting festival melody with bansuri flute & sitar plucks (no background drum loops)
        if (step % 8 === 0 || step % 8 === 4) {
          this.synthesizeFlute(ragBhupali[(step / 2) % ragBhupali.length], 0.11, 0.6, t);
        }
        if (step % 8 === 6 && this.backgroundBells) {
          this.playBell();
        }
        const noteIdx = [0, 1, 2, 4, 3, 2, 1, 0][step % 8];
        this.synthesizePluck(ragBhupali[noteIdx], 0.16, 0.45, t);
      } else if (theme === 'STORM') {
        // Deep ominous drone
        if (step % 8 === 0) {
          const freq = stormNotes[step % stormNotes.length];
          this.synthesizeDrone(freq, 0.22, 1.8, t);
        }
      } else if (theme === 'PROCESSION') {
        // Joyous melodic procession atmosphere with shehnai & sitar (drums reserved for player actions)
        if (step % 4 === 0) {
          const f = ragBhupali[(step / 4) % ragBhupali.length] * 1.5;
          this.synthesizePluck(f, 0.14, 0.5, t);
        }
        if (step % 8 === 0) {
          this.playShehnaiNote(587.33, 0.45);
        } else if (step % 8 === 4 && this.backgroundBells) {
          this.playBell();
        }
      } else if (theme === 'VISARJAN') {
        // Meditative, emotional bansuri flute-style tone
        if (step % 6 === 0) {
          const f = visarjanNotes[(step / 6) % visarjanNotes.length];
          this.synthesizeFlute(f, 0.15, 1.6, t);
        }
      }

      step++;
    }, intervalMs);
  }

  synthesizePluck(freq, volume, decay, t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume * this.musicVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(t);
    osc.stop(t + decay);
  }

  synthesizeDrone(freq, volume, dur, t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume * this.musicVolume, t);
    gain.gain.linearRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(t);
    osc.stop(t + dur);
  }

  synthesizeFlute(freq, volume, dur, t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    // Vibrato
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(5, t);
    lfoGain.gain.setValueAtTime(4, t);
    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(volume * this.musicVolume, t + 0.3);
    gain.gain.linearRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    gain.connect(this.musicGain);

    lfo.start(t);
    osc.start(t);
    lfo.stop(t + dur);
    osc.stop(t + dur);
  }

  synthesizePercussion(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.04);
    gain.gain.setValueAtTime(0.12 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  stopMusic() {
    if (this.musicLoopInterval) {
      clearInterval(this.musicLoopInterval);
      this.musicLoopInterval = null;
    }
    this.currentMusic = null;
  }

  // --- FESTIVAL CHANTS & CROWD VOCALS ---
  playChantMorya() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Harmonized Vocal Formant Burst ("Ganpati Bappa Morya!")
    const formants = [220, 275, 330, 440, 550]; // Rich A-major vocal cluster
    formants.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800 + idx * 250, t); // Vocal tract resonance
      filter.Q.setValueAtTime(3.5, t);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 1.12, t + 0.35);
      osc.frequency.linearRampToValueAtTime(freq * 0.95, t + 0.85);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.08 * this.sfxVolume, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.9);
    });

    // Crowd cheer noise envelope
    const bufferSize = this.ctx.sampleRate * 1.0;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1400, t);
    noiseFilter.Q.setValueAtTime(1.5, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, t);
    noiseGain.gain.linearRampToValueAtTime(0.18 * this.sfxVolume, t + 0.25);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(t);
  }

  // --- THUNDEROUS NASHIK DHOL-TASHA BEAT ---
  playDholBeat() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // 1. Heavy Bass Dhol Thump (80Hz -> 45Hz punch)
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(110, t);
    bassOsc.frequency.exponentialRampToValueAtTime(42, t + 0.16);

    bassGain.gain.setValueAtTime(0.45 * this.sfxVolume, t);
    bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    bassOsc.connect(bassGain);
    bassGain.connect(this.sfxGain);
    bassOsc.start(t);
    bassOsc.stop(t + 0.28);

    // 2. Crisp Metallic Tasha Rim Crack (1100Hz square crack)
    const tashaOsc = this.ctx.createOscillator();
    const tashaGain = this.ctx.createGain();
    const tashaFilter = this.ctx.createBiquadFilter();

    tashaFilter.type = 'highpass';
    tashaFilter.frequency.setValueAtTime(800, t);

    tashaOsc.type = 'triangle';
    tashaOsc.frequency.setValueAtTime(1250, t);
    tashaOsc.frequency.exponentialRampToValueAtTime(350, t + 0.06);

    tashaGain.gain.setValueAtTime(0.35 * this.sfxVolume, t);
    tashaGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    tashaOsc.connect(tashaFilter);
    tashaFilter.connect(tashaGain);
    tashaGain.connect(this.sfxGain);
    tashaOsc.start(t);
    tashaOsc.stop(t + 0.08);
  }

  // --- AUSPICIOUS SHEHNAI MELODY HARMONIC ---
  playShehnaiNote(pitch = 587.33, duration = 0.4) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Double-reed nasal harmonic overtones
    const harmonics = [1, 2, 3, 5];
    harmonics.forEach((h, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(pitch * h, t);

      // Microtonal grace slide (meend)
      osc.frequency.linearRampToValueAtTime(pitch * h * 1.03, t + duration * 0.3);
      osc.frequency.linearRampToValueAtTime(pitch * h, t + duration);

      const amp = (0.08 / (idx + 1)) * this.musicVolume;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(amp, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + duration);
    });
  }

  // --- TRADITIONAL LEZIM CYMBAL JINGLE ---
  playLezim() {
    if (!this.ctx || this.isMuted) return;
    this.vibrate([25]);
    const t = this.ctx.currentTime;
    // Jingle of multiple thin brass discs (cymbals) hitting in rapid succession
    const freqs = [2400, 3100, 3850, 4600];
    freqs.forEach((freq, i) => {
      const delay = i * 0.012;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + delay);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, t + delay);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + delay);
      osc.stop(t + delay + 0.09);
    });
  }

  // --- GULAL COLOR SPLASH WHOOSH & SPARKLE ---
  playGulalSplash() {
    if (!this.ctx || this.isMuted) return;
    this.vibrate([35]);
    const t = this.ctx.currentTime;

    // Airy white noise puff
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, t);
    filter.frequency.linearRampToValueAtTime(1600, t + 0.2);
    filter.Q.value = 2.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + 0.25);
  }

  // --- POLAROID CAMERA SHUTTER CLICK ---
  playShutter() {
    if (!this.ctx || this.isMuted) return;
    this.vibrate([20, 30, 20]);
    const t = this.ctx.currentTime;

    // Quick snap click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  // --- MOBILE DEVICE HAPTIC FEEDBACK ---
  vibrate(pattern = [30]) {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (_) {}
  }
}

export const audioManager = new AudioManager();
