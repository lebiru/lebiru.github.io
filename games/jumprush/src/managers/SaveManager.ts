import type { Settings } from '../config';
import { GAME } from '../config';

export class SaveManager {
  private settings: Settings;
  public constructor() { this.settings = this.load(); }
  private load(): Settings { try { const raw = localStorage.getItem(GAME.storageKey); return { sound: true, music: false, reducedShake: false, best: 0, ...JSON.parse(raw ?? '{}') } as Settings; } catch { return { sound: true, music: false, reducedShake: false, best: 0 }; } }
  public get(): Settings { return { ...this.settings }; }
  public update(values: Partial<Settings>): Settings { this.settings = { ...this.settings, ...values }; localStorage.setItem(GAME.storageKey, JSON.stringify(this.settings)); return this.get(); }
  public best(score: number): boolean { if (score <= this.settings.best) return false; this.update({ best: score }); return true; }
}
