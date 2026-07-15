export const GAME = {
  width: 960, height: 540, gravity: 1750, playerX: 180, playerSize: 34,
  baseSpeed: 235, speedStepScore: 10, speedStepMultiplier: 1.04,
  jumpVelocity: -625, platformHeight: 28, floorY: 500, chunkWidth: 310,
  perfectRatio: 0.2, obstacleScore: 1, gemScore: 5, perfectScore: 2,
  maxCombo: 5, storageKey: 'jumprush-settings-v1'
} as const;
export type Settings = { sound: boolean; music: boolean; reducedShake: boolean; best: number };
export const palette = { ink: 0x090b18, panel: 0x14182d, cyan: 0x3cf5ff, blue: 0x3275ff, pink: 0xff4d9a, gold: 0xffdc5c, white: 0xeaf6ff, danger: 0xff4567 } as const;
