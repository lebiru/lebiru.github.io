import { GAME } from '../config';
export class ScoreManager {
  public score = 0; public combo = 1; public gems = 0;
  public addLanding(perfect: boolean): number { this.combo = perfect ? Math.min(GAME.maxCombo, this.combo + 1) : 1; if (perfect) this.score += GAME.perfectScore * this.combo; return this.score; }
  public addObstacle(): number { this.score += GAME.obstacleScore * this.combo; return this.score; }
  public addGem(): number { this.gems++; this.score += GAME.gemScore * this.combo; return this.score; }
  public speed(): number { return GAME.baseSpeed * Math.pow(GAME.speedStepMultiplier, Math.floor(this.score / GAME.speedStepScore)); }
}
