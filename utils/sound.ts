
export class AudioManager {
  private ctx: AudioContext | null = null;
  private musicInterval: number | null = null;
  private isMuted: boolean = false;
  private tempo: number = 120;
  private noteIndex: number = 0;

  constructor() {
    // Context is initialized on user interaction
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isMuted;
  }

  // --- Sound Effects ---

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playClick() {
    // High pitched click for UI
    this.playTone(800, 'sine', 0.05, 0.05);
  }

  public playPop() {
    // "Pop" sound for picking up
    if (this.isMuted || !this.ctx) return;
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.frequency.setValueAtTime(200, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx!.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.1);
  }

  public playRoll() {
    // Rattle sound
    if (this.isMuted) return;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playTone(400 + Math.random() * 200, 'square', 0.05, 0.05);
      }, i * 60);
    }
  }

  public playSuccess() {
    // Nice chime
    if (this.isMuted) return;
    this.playTone(523.25, 'sine', 0.3, 0.2); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.3, 0.2), 100); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.4, 0.2), 200); // G5
  }

  public playError() {
    // Buzzer
    if (this.isMuted) return;
    this.playTone(150, 'sawtooth', 0.3, 0.15);
    setTimeout(() => this.playTone(100, 'sawtooth', 0.3, 0.15), 100);
  }

  public playWin() {
    // Fanfare
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 'triangle', 0.5, 0.2), i * 150);
    });
  }

  // --- Background Music (Simple Sequencer) ---

  public startMusic() {
    if (this.isMuted || this.musicInterval) return;
    this.init();
    
    // A simple ambient loop
    const bassLine = [
      { f: 130.81, l: 4 }, // C3
      { f: 130.81, l: 4 },
      { f: 174.61, l: 4 }, // F3
      { f: 174.61, l: 4 },
      { f: 196.00, l: 4 }, // G3
      { f: 196.00, l: 4 },
      { f: 146.83, l: 4 }, // D3
      { f: 196.00, l: 4 },
    ];

    let tick = 0;
    this.musicInterval = window.setInterval(() => {
      if (!this.ctx) return;
      
      const note = bassLine[tick % bassLine.length];
      
      // Play softer ambient bass
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle'; // Softer than square
      osc.frequency.setValueAtTime(note.f, this.ctx.currentTime);
      
      // Envelope for soft pad feel
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.1);
      gain.gain.linearRampToValueAtTime(0, now + 0.5); // duration of beat

      // Lowpass filter to make it "underwater" / ambient
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(now + 0.6);

      tick++;
    }, 600); // BPM related
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundManager = new AudioManager();
