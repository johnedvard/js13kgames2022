import { emit } from 'kontra';

import { isBoxCollision } from './utils';
import { GOAL_COLLISION, LEVEL_COMPLETE } from './gameEvents';
import { playGoal } from './sound';

export class Goal {
  level;
  scale = 1;
  width = 60;
  height = 32;
  originalRadius = { x: 15, y: 30 };
  radiusX = 15;
  radiusY = 30;
  hasWon = false;
  hasVanished = false;
  vanishSpeed = 0.3;
  isVanishihng = false;

  constructor(x, y, { level }) {
    this.x = x;
    this.y = y;
    this.level = level;
  }
  update() {
    if (this.hasVanished) return;
    this.checkCollision();
  }
  render(ctx) {
    if (!ctx || this.hasVanished) return;
    ctx.lineWidth = 4;
    ctx.beginPath();

    if (this.hasWon) {
      this.startVanishing();
    }
    // ctx.rect(this.x, this.y, this.width, this.height); // Render collision box
    ctx.ellipse(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.radiusX,
      this.radiusY,
      Math.PI / 2,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  startVanishing() {
    // XXX Only play goal sound when we start vanishing goal for the first time
    // TODO (johnedvard) emit isvanishing event
    if (!this.isVanishihng) {
      playGoal();
    }
    this.isVanishihng = true;
    this.radiusX -= this.vanishSpeed;
    this.radiusY -= this.vanishSpeed * 2;
    if (this.radiusX <= 0) this.radiusX = 0;
    if (this.radiusY <= 0) this.radiusY = 0;
    if (this.radiusX <= 0 && this.radiusY <= 0) {
      this.hasVanished = true;
      emit(LEVEL_COMPLETE);
    }
  }
  checkCollision() {
    if (
      isBoxCollision(
        {
          x: this.x,
          y: this.y,
          width: this.width,
          height: this.height,
        },
        this.level.player.sprite
      )
    ) {
      this.hasWon = true;
      emit(GOAL_COLLISION);
    }
  }
}
