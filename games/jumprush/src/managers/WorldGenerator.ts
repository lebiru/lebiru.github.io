import type Phaser from 'phaser';
import { GAME } from '../config';

type HazardKind = 'spike' | 'wall' | 'double';
type Chunk = { width: number; y: number; hazard: HazardKind | null; gem: boolean };
const chunks: readonly Chunk[] = [
  { width: 255, y: 500, hazard: null, gem: true },
  { width: 190, y: 470, hazard: 'spike', gem: true },
  { width: 225, y: 440, hazard: 'wall', gem: false },
  { width: 250, y: 490, hazard: 'double', gem: true },
  { width: 185, y: 455, hazard: 'spike', gem: true },
  { width: 230, y: 475, hazard: 'wall', gem: true }
];
export class WorldGenerator {
  public readonly platforms: Phaser.Physics.Arcade.StaticGroup;
  public readonly hazards: Phaser.Physics.Arcade.StaticGroup;
  public readonly gems: Phaser.Physics.Arcade.Group;
  private nextX = -140; private index = 0;
  public constructor(private readonly scene: Phaser.Scene) { this.platforms = scene.physics.add.staticGroup(); this.hazards = scene.physics.add.staticGroup(); this.gems = scene.physics.add.group({ allowGravity: false, immovable: true }); this.addStart(); }
  private addStart(): void { this.addPlatform(-180, GAME.floorY, 830); this.nextX = 650; }
  public update(worldX: number): void { while (this.nextX < worldX + GAME.width * 1.7) this.addChunk(); this.clean(worldX - 250); }
  public collectPassedHazards(playerX: number): number {
    let passed = 0;
    this.hazards.children.each((child) => {
      const hazard = child as Phaser.Physics.Arcade.Sprite;
      if (!hazard.getData('passed') && playerX > hazard.x + hazard.displayWidth / 2) {
        hazard.setData('passed', true);
        passed += 1;
      }
      return true;
    });
    return passed;
  }
  private addChunk(): void { const chunk = chunks[this.index++ % chunks.length]!; const gap = 80 + ((this.index * 31) % 48); this.addPlatform(this.nextX, chunk.y, chunk.width); const platformCenter = this.nextX + chunk.width / 2; if (chunk.hazard === 'spike') this.hazards.create(platformCenter + 30, chunk.y - 17, 'spike'); if (chunk.hazard === 'wall') this.hazards.create(platformCenter + 38, chunk.y - 42, 'wall'); if (chunk.hazard === 'double') { this.hazards.create(platformCenter + 20, chunk.y - 17, 'spike'); this.hazards.create(platformCenter + 49, chunk.y - 17, 'spike'); }
    if (chunk.gem) { const gem = this.gems.create(platformCenter - 18, chunk.y - 82, 'gem') as Phaser.Physics.Arcade.Sprite; gem.setData('collected', false); gem.play('gem-spin'); }
    this.nextX += chunk.width + gap;
  }
  private addPlatform(x: number, y: number, width: number): void { const platform = this.platforms.create(x + width / 2, y, 'platform') as Phaser.Physics.Arcade.Sprite; platform.setDisplaySize(width, GAME.platformHeight).refreshBody(); }
  private clean(left: number): void { [this.platforms, this.hazards, this.gems].forEach((group) => group.children.each((child) => { const object = child as Phaser.GameObjects.GameObject & { x?: number }; if ((object.x ?? left) < left) object.destroy(); return true; })); }
}

