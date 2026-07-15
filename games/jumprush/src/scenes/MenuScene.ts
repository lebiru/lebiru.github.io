import Phaser from 'phaser';
import { palette, type Settings } from '../config';
import type { SaveManager } from '../managers/SaveManager';
import type { AudioManager } from '../managers/AudioManager';

type SettingKey = keyof Pick<Settings, 'sound' | 'music' | 'reducedShake'>;
export class MenuScene extends Phaser.Scene {
  private save!: SaveManager; private audio!: AudioManager; private settings!: Settings; private optionTexts: Phaser.GameObjects.Text[] = [];
  public constructor() { super('MenuScene'); }
  public create(): void {
    this.save = this.registry.get('save') as SaveManager; this.audio = this.registry.get('audio') as AudioManager; this.settings = this.save.get();
    this.add.rectangle(480, 270, 960, 540, palette.ink).setOrigin(.5);
    for (let i = 0; i < 14; i++) this.add.rectangle(40 + i * 76, 150 + (i % 4) * 90, 58, 2, palette.blue, .22).setRotation(-.2);
    this.add.text(480, 112, 'JUMP', { fontFamily: 'Arial Black, sans-serif', fontSize: '67px', color: '#3cf5ff', stroke: '#142d64', strokeThickness: 8 }).setOrigin(.5);
    this.add.text(480, 177, 'RUSH', { fontFamily: 'Arial Black, sans-serif', fontSize: '67px', color: '#ff4d9a', stroke: '#4b1537', strokeThickness: 8 }).setOrigin(.5);
    this.add.text(480, 264, 'ONE BUTTON. ZERO MERCY.', { fontFamily: 'monospace', fontSize: '17px', color: '#eaf6ff' }).setOrigin(.5);
    this.add.text(480, 302, 'SPACE  /  CLICK  /  TAP  to jump', { fontFamily: 'Arial', fontSize: '16px', color: '#91a5cb' }).setOrigin(.5);
    this.button(480, 365, 'START RUN', () => this.start());
    this.addOption(210, 'SOUND', 'sound'); this.addOption(480, 'MUSIC', 'music'); this.addOption(750, 'REDUCED SHAKE', 'reducedShake'); this.renderOptions();
    this.add.text(480, 508, `BEST SCORE  ${this.settings.best}`, { fontFamily: 'Arial Black, sans-serif', fontSize: '15px', color: '#ffdc5c' }).setOrigin(.5);
    this.input.keyboard?.once('keydown-SPACE', () => this.start());
  }
  private button(x: number, y: number, label: string, click: () => void): void { const box = this.add.rectangle(x, y, 250, 54, palette.blue).setStrokeStyle(2, palette.cyan).setInteractive({ useHandCursor: true }); const text = this.add.text(x, y, label, { fontFamily: 'Arial Black, sans-serif', fontSize: '21px', color: '#fff' }).setOrigin(.5); box.on('pointerover', () => { box.setFillStyle(palette.pink); text.setScale(1.05); }); box.on('pointerout', () => { box.setFillStyle(palette.blue); text.setScale(1); }); box.on('pointerdown', click); }
  private addOption(x: number, label: string, key: SettingKey): void { const text = this.add.text(x, 440, '', { fontFamily: 'monospace', fontSize: '13px', color: '#b9c8e9', align: 'center' }).setOrigin(.5).setInteractive({ useHandCursor: true }); text.setData('label', label); text.setData('key', key); text.on('pointerdown', () => this.toggle(key)); this.optionTexts.push(text); }
  private toggle(key: SettingKey): void { this.settings = this.save.update({ [key]: !this.settings[key] }); this.audio.setSettings(this.settings); this.audio.unlock(); this.audio.play('gem'); this.renderOptions(); }
  private renderOptions(): void { this.optionTexts.forEach((text) => { const key = text.getData('key') as SettingKey; text.setText(`${text.getData('label') as string}\n${this.settings[key] ? 'ON' : 'OFF'}`).setColor(this.settings[key] ? '#3cf5ff' : '#91a5cb'); }); }
  private start(): void { this.audio.unlock(); this.audio.play('click'); this.audio.music(); this.scene.start('GameScene'); }
}
