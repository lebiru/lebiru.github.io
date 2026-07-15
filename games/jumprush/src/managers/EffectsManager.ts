import Phaser from 'phaser';
import { palette } from '../config';
export class EffectsManager {
  public constructor(private readonly scene: Phaser.Scene, private readonly reducedShake: () => boolean) {}
  public burst(x: number, y: number, color: number = palette.cyan, amount = 9): void { const particles = this.scene.add.particles(x, y, 'dot', { speed: { min: 55, max: 190 }, scale: { start: .7, end: 0 }, lifespan: 360, quantity: amount, tint: color, emitting: false }); particles.explode(); this.scene.time.delayedCall(450, () => particles.destroy()); }
  public shake(intensity = .007, duration = 100): void { if (!this.reducedShake()) this.scene.cameras.main.shake(duration, intensity); }
  public bump(): void { this.shake(.002, 35); }
  public flash(color: number, duration = 80): void { const flash = Phaser.Display.Color.ValueToColor(color); this.scene.cameras.main.flash(duration, flash.red, flash.green, flash.blue, false); }
  public squash(target: Phaser.GameObjects.Sprite, x: number, y: number): void { this.scene.tweens.add({ targets: target, scaleX: x, scaleY: y, duration: 65, yoyo: true }); }
  public pauseHit(): void { this.scene.physics.world.pause(); this.scene.time.delayedCall(80, () => this.scene.physics.world.resume()); }
}
