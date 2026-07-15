import type { Settings } from '../config';

export type SoundName = 'jump' | 'land' | 'gem' | 'perfect' | 'death' | 'click';
export class AudioManager {
  private context: AudioContext | null = null; private musicOscillator: OscillatorNode | null = null; private settings: Settings;
  public constructor(settings: Settings) { this.settings = settings; }
  public setSettings(settings: Settings): void { this.settings = settings; if (!settings.music && this.musicOscillator) { this.musicOscillator.stop(); this.musicOscillator = null; } }
  public unlock(): void { if (!this.context) this.context = new AudioContext(); if (this.context.state === 'suspended') void this.context.resume(); }
  public play(name: SoundName): void { if (!this.settings.sound) return; this.unlock(); const ctx = this.context; if (!ctx) return; const spec: Record<SoundName, [number, number, number]> = { jump: [420, 690, .07], land: [140, 90, .05], gem: [760, 1200, .09], perfect: [520, 1040, .16], death: [170, 50, .22], click: [390, 560, .04] }; const [from, to, duration] = spec[name]; const oscillator = ctx.createOscillator(); const gain = ctx.createGain(); oscillator.type = name === 'death' ? 'sawtooth' : 'sine'; oscillator.frequency.setValueAtTime(from, ctx.currentTime); oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, to), ctx.currentTime + duration); gain.gain.setValueAtTime(.08, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration); oscillator.connect(gain).connect(ctx.destination); oscillator.start(); oscillator.stop(ctx.currentTime + duration); }
  public music(): void { if (!this.settings.music || this.musicOscillator) return; this.unlock(); const ctx = this.context; if (!ctx) return; const oscillator = ctx.createOscillator(); const gain = ctx.createGain(); oscillator.type = 'triangle'; oscillator.frequency.value = 92; gain.gain.value = .016; oscillator.connect(gain).connect(ctx.destination); oscillator.start(); this.musicOscillator = oscillator; }
}
