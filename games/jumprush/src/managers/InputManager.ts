import type Phaser from 'phaser';
export class InputManager {
  private pressed = false;
  public constructor(scene: Phaser.Scene, callback: () => void) {
    const fire = (): void => { if (!this.pressed) { this.pressed = true; callback(); } };
    const release = (): void => { this.pressed = false; };
    scene.input.keyboard?.on('keydown-SPACE', fire); scene.input.keyboard?.on('keyup-SPACE', release);
    scene.input.on('pointerdown', fire); scene.input.on('pointerup', release); scene.input.on('pointerout', release);
  }
  public destroy(): void { this.pressed = false; }
}
