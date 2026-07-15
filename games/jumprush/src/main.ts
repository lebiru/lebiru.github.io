import Phaser from 'phaser';
import './style.css';
import { GAME } from './config';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: GAME.width, height: GAME.height, backgroundColor: '#090b18', physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } }, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: [BootScene, MenuScene, GameScene, GameOverScene], render: { antialias: true, pixelArt: false } });

