import Phaser from 'phaser';
import { palette } from '../config';
import { SaveManager } from '../managers/SaveManager';
import { AudioManager } from '../managers/AudioManager';

export class BootScene extends Phaser.Scene {
  public constructor() { super('BootScene'); }
  public create(): void {
    this.makeTextures();
    const save = new SaveManager(); this.registry.set('save', save); this.registry.set('audio', new AudioManager(save.get()));
    this.anims.create({ key: 'gem-spin', frames: this.anims.generateFrameNumbers('gem', { start: 0, end: 5 }), frameRate: 12, repeat: -1 });
    this.scene.start('MenuScene');
  }
  private makeTextures(): void {
    const make = (key: string, draw: (g: Phaser.GameObjects.Graphics) => void, width: number, height: number): void => { const g = this.add.graphics(); draw(g); g.generateTexture(key, width, height); g.destroy(); };
    make('player', (g) => { g.fillStyle(palette.cyan); g.fillRoundedRect(2, 4, 30, 28, 8); g.fillStyle(palette.ink); g.fillCircle(23, 13, 3); g.lineStyle(2, palette.white); g.strokeRoundedRect(2, 4, 30, 28, 8); }, 34, 36);
    make('platform', (g) => { g.fillStyle(palette.panel); g.fillRect(0, 0, 64, 28); g.lineStyle(2, palette.blue); g.strokeRect(1, 1, 62, 26); g.fillStyle(palette.blue, .3); g.fillRect(0, 3, 64, 3); }, 64, 28);
    make('spike', (g) => { g.fillStyle(palette.danger); g.fillTriangle(1, 30, 16, 1, 31, 30); g.lineStyle(2, palette.white); g.strokeTriangle(1, 30, 16, 1, 31, 30); }, 32, 31);
    make('wall', (g) => { g.fillStyle(palette.danger); g.fillRect(2, 2, 30, 76); g.lineStyle(2, palette.white); g.strokeRect(2, 2, 30, 76); g.lineStyle(2, palette.pink); g.lineBetween(5, 20, 29, 20); }, 34, 80);
    make('dot', (g) => { g.fillStyle(palette.cyan); g.fillCircle(4, 4, 4); }, 8, 8);
    const gemSheet = this.add.graphics();
    for (let i = 0; i < 6; i++) { const x = 12 + i * 24; gemSheet.fillStyle(i % 2 === 0 ? palette.blue : palette.cyan); gemSheet.fillTriangle(x, 1, x + 10, 12, x, 23); gemSheet.fillTriangle(x, 1, x - 10, 12, x, 23); gemSheet.lineStyle(1, palette.white); gemSheet.strokeTriangle(x, 1, x + 10, 12, x, 23); gemSheet.strokeTriangle(x, 1, x - 10, 12, x, 23); }
    gemSheet.generateTexture('gem', 144, 24); gemSheet.destroy();
    const gemTexture = this.textures.get('gem');
    for (let i = 0; i < 6; i++) gemTexture.add(i, 0, i * 24, 0, 24, 24);
  }
}


