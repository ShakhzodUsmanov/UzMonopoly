// Web Audio API Synthesizer for UzMonopoly (0 external MP3 dependencies)
class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    // Lazy initialize on first interaction
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('uzmonopoly_sound_enabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    }
  }

  private initCtx(): AudioContext | null {
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
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.enabled = !this.enabled;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('uzmonopoly_sound_enabled', String(this.enabled));
    }
    return this.enabled;
  }

  // 1. Dice roll: rattle crackle
  public playDiceRoll() {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    for (let i = 0; i < 6; i++) {
      const startTime = ctx.currentTime + i * 0.045 + Math.random() * 0.02;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 260, startTime);
      osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.04);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.05);
    }
  }

  // 2. Token step: short crisp wood/tick
  public playTokenStep() {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.035);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  }

  // 3. Purchase: coin cha-ching / gold chime
  public playCoin() {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const playChime = (freq: number, startDelay: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);

      gain.gain.setValueAtTime(0.16, ctx.currentTime + startDelay);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startDelay + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startDelay);
      osc.stop(ctx.currentTime + startDelay + 0.36);
    };

    playChime(987.77, 0); // B5
    playChime(1318.51, 0.09); // E6
  }

  // 4. Jail: heavy metallic slam/clang
  public playJailSlam() {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  }

  // 5. Bankruptcy: descending trombone tone
  public playBankruptcy() {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.7);
  }

  // 6. Victory: uplifting brass fanfare (C-E-G-C)
  public playVictoryFanfare() {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const notes = [
      { freq: 261.63, delay: 0.0, dur: 0.12 }, // C4
      { freq: 329.63, delay: 0.14, dur: 0.12 }, // E4
      { freq: 392.0, delay: 0.28, dur: 0.14 }, // G4
      { freq: 523.25, delay: 0.44, dur: 0.6 }, // C5
    ];

    for (const n of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.delay);

      gain.gain.setValueAtTime(0.22, ctx.currentTime + n.delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.delay + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + n.delay);
      osc.stop(ctx.currentTime + n.delay + n.dur + 0.05);
    }
  }

  // 7. Button click / UI tap
  public playClick() {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.035);
  }
}

export const audioService = new SoundFX();
