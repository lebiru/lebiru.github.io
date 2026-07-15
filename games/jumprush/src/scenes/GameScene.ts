import Phaser from 'phaser';
import { GAME, palette } from '../config';
import type { AudioManager } from '../managers/AudioManager';
import { EffectsManager } from '../managers/EffectsManager';
import { InputManager } from '../managers/InputManager';
import type { SaveManager } from '../managers/SaveManager';
import { ScoreManager } from '../managers/ScoreManager';
import { WorldGenerator } from '../managers/WorldGenerator';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite; private world!: WorldGenerator; private score!: ScoreManager; private audio!: AudioManager; private effects!: EffectsManager; private inputManager!: InputManager; private hud!: Phaser.GameObjects.Text; private combo!: Phaser.GameObjects.Text; private dead = false; private airborne = false;
  public constructor() { super('GameScene'); }
  public create(): void {
    this.dead = false; this.score = new ScoreManager(); const save = this.registry.get('save') as SaveManager; this.audio = this.registry.get('audio') as AudioManager; this.effects = new EffectsManager(this, () => save.get().reducedShake);
    this.physics.world.gravity.y = GAME.gravity; this.createBackground(); this.world = new WorldGenerator(this);
    this.player = this.physics.add.sprite(GAME.playerX, 430, 'player').setCollideWorldBounds(false); this.player.setDepth(4); this.player.setSize(26, 31).setOffset(4, 4); this.player.setMaxVelocity(900, 900);
    this.physics.add.collider(this.player, this.world.platforms, (_player, platform) => this.land(platform as Phaser.Physics.Arcade.Sprite)); this.physics.add.overlap(this.player, this.world.hazards, () => this.die()); this.physics.add.overlap(this.player, this.world.gems, (_player, gem) => this.collect(gem as Phaser.Physics.Arcade.Sprite));
    this.cameras.main.startFollow(this.player, true, .12, .12); this.cameras.main.setDeadzone(120, 540); this.cameras.main.setBounds(0, 0, 100000, 540);
    this.hud = this.add.text(24, 20, 'SCORE 0', { fontFamily: 'Arial Black, sans-serif', fontSize: '25px', color: '#eaf6ff', stroke: '#090b18', strokeThickness: 5 }).setScrollFactor(0).setDepth(10); this.combo = this.add.text(24, 54, 'COMBO x1', { fontFamily: 'monospace', fontSize: '16px', color: '#3cf5ff' }).setScrollFactor(0).setDepth(10);
    this.add.text(936, 22, 'SPACE / TAP', { fontFamily: 'monospace', fontSize: '12px', color: '#91a5cb' }).setOrigin(1, 0).setScrollFactor(0).setDepth(10);
    this.inputManager = new InputManager(this, () => this.jump()); this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.inputManager.destroy());
  }
  public override update(): void { if (this.dead) return; const body = this.player.body as Phaser.Physics.Arcade.Body; this.player.setVelocityX(this.score.speed()); this.world.update(this.player.x); for (let passed = this.world.collectPassedHazards(this.player.x); passed > 0; passed -= 1) this.score.addObstacle(); this.airborne ||= !body.blocked.down; if (this.player.y > GAME.height + 120) this.die(); this.player.setRotation(Phaser.Math.Clamp(body.velocity.y / 1500, -.25, .25)); this.hud.setText(`SCORE ${this.score.score}`); this.combo.setText(`COMBO x${this.score.combo}   GEMS ${this.score.gems}`); }
  private jump(): void { if (this.dead) return; const body = this.player.body as Phaser.Physics.Arcade.Body; if (body.blocked.down || body.touching.down) { this.player.setVelocityY(GAME.jumpVelocity); this.airborne = true; this.audio.play('jump'); this.effects.bump(); this.effects.squash(this.player, .78, 1.24); this.effects.burst(this.player.x, this.player.y + 16, palette.blue, 4); } }
  private land(platform: Phaser.Physics.Arcade.Sprite): void { const body = this.player.body as Phaser.Physics.Arcade.Body; if (!this.airborne || body.velocity.y < 40) return; this.airborne = false; const center = platform.x; const perfect = Math.abs(this.player.x - center) <= (platform.displayWidth * GAME.perfectRatio / 2); this.score.addLanding(perfect); this.audio.play(perfect ? 'perfect' : 'land'); this.effects.squash(this.player, 1.24, .72); this.effects.burst(this.player.x, platform.y - 14, perfect ? palette.gold : palette.cyan, perfect ? 16 : 7); if (perfect) { this.effects.flash(palette.gold); this.effects.shake(.004, 70); this.effects.pauseHit(); const label = this.add.text(this.player.x, this.player.y - 50, 'PERFECT!', { fontFamily: 'Arial Black, sans-serif', fontSize: '17px', color: '#ffdc5c' }).setOrigin(.5); this.tweens.add({ targets: label, y: label.y - 34, alpha: 0, duration: 550, onComplete: () => label.destroy() }); } }
  private collect(gem: Phaser.Physics.Arcade.Sprite): void { if (gem.getData('collected') as boolean) return; gem.setData('collected', true); this.score.addGem(); this.audio.play('gem'); this.effects.burst(gem.x, gem.y, palette.blue, 12); this.tweens.add({ targets: gem, scale: 1.8, alpha: 0, duration: 150, onComplete: () => gem.destroy() }); }
  private die(): void { if (this.dead) return; this.dead = true; this.player.setTint(palette.danger); this.player.setVelocity(0, 0); this.audio.play('death'); this.effects.burst(this.player.x, this.player.y, palette.danger, 24); this.effects.shake(.018, 160); this.effects.pauseHit(); const save = this.registry.get('save') as SaveManager; const isBest = save.best(this.score.score); this.time.delayedCall(430, () => this.scene.start('GameOverScene', { score: this.score.score, best: save.get().best, isBest })); }
  private createBackground(): void { this.add.rectangle(480, 270, 960, 540, palette.ink).setScrollFactor(0); for (let i = 0; i < 18; i++) { this.add.circle(20 + ((i * 149) % 930), 80 + ((i * 71) % 360), i % 3 === 0 ? 2 : 1, palette.cyan, .32).setScrollFactor(.15); } this.add.rectangle(480, 506, 960, 4, palette.pink, .32).setScrollFactor(.2); }
}
