import Phaser from 'phaser';
import { palette } from '../config';
import type { AudioManager } from '../managers/AudioManager';

type Results = { score: number; best: number; isBest: boolean };
export class GameOverScene extends Phaser.Scene {
  private results!: Results;
  public constructor() { super('GameOverScene'); }
  public init(data: Results): void { this.results = data; }
  public create(): void {
    this.add.rectangle(480, 270, 960, 540, 0x050611, .83);
    this.add.text(480, 145, 'RUN OVER', { fontFamily: 'Arial Black, sans-serif', fontSize: '50px', color: '#ff4567', stroke: '#4b1537', strokeThickness: 8 }).setOrigin(.5);
    if (this.results.isBest) this.add.text(480, 208, 'NEW BEST!', { fontFamily: 'Arial Black, sans-serif', fontSize: '22px', color: '#ffdc5c' }).setOrigin(.5);
    this.add.text(480, 258, `SCORE  ${this.results.score}`, { fontFamily: 'monospace', fontSize: '27px', color: '#eaf6ff' }).setOrigin(.5);
    this.add.text(480, 296, `BEST   ${this.results.best}`, { fontFamily: 'monospace', fontSize: '18px', color: '#91a5cb' }).setOrigin(.5);
    const button = this.add.rectangle(480, 372, 266, 55, palette.blue).setStrokeStyle(2, palette.cyan).setInteractive({ useHandCursor: true }); this.add.text(480, 372, 'RUN IT BACK', { fontFamily: 'Arial Black, sans-serif', fontSize: '19px', color: '#fff' }).setOrigin(.5); button.on('pointerdown', () => this.restart());
    this.add.text(480, 442, 'SPACE / CLICK / TAP TO RESTART', { fontFamily: 'monospace', fontSize: '14px', color: '#b9c8e9' }).setOrigin(.5);
    this.time.delayedCall(220, () => { this.input.once('pointerdown', () => this.restart()); this.input.keyboard?.once('keydown-SPACE', () => this.restart()); });
  }
  private restart(): void { (this.registry.get('audio') as AudioManager).play('click'); this.scene.start('GameScene'); }
}
