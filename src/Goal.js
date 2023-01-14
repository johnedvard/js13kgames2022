import swirl from 'data-url:./assets/img/Portal_game_large.png';

import { emit } from 'kontra';

import { createSprite, isBoxCollision } from './utils';
import { GOAL_COLLISION, LEVEL_COMPLETE } from './gameEvents';
import { playGoal } from './sound';

export class Goal {
  level;
  scale = 1;
  width = 45;
  height = 36;
  originalRadius = { x: 15, y: 30 };
  radiusX = 15;
  radiusY = 30;
  hasWon = false;
  hasVanished = false;
  vanishSpeed = 0.3;
  isVanishihng = false;
  sprite;

  constructor(x, y, { level }) {
    this.x = x + 6; // make up for size adjustment to swirl
    this.y = y;
    this.level = level;
    createSprite({
      x: x + 26,
      y: y + 20,
      scale: 1.5,
      imgSrc: swirl,
      width: this.width,
      height: this.height,
      anchor: { x: 0.5, y: 0.5 },
    }).then((sprite) => (this.sprite = sprite));
  }
  update(dt) {
    if (this.hasVanished) return;
    this.checkCollision();
    this.sprite.rotation += dt * 4;
  }
  render(ctx) {
    if (!ctx || this.hasVanished) return;
    this.sprite.render(ctx);
    // ctx.lineWidth = 4;
    // ctx.beginPath();

    if (this.hasWon) {
      this.startVanishing();
    }
    // ctx.rect(this.x, this.y, this.width, this.height); // Render collision box
    // ctx.ellipse(
    //   this.x + this.width / 2,
    //   this.y + this.height / 2,
    //   this.radiusX,
    //   this.radiusY,
    //   Math.PI / 2,
    //   0,
    //   Math.PI * 2
    // );
    // ctx.stroke();
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
        {
          x: this.level.player.sprite.x - 30, // make up for scaling
          y: this.level.player.sprite.y - 30,
          width: this.level.player.sprite.width * this.level.player.scale,
          height: this.level.player.sprite.height * this.level.player.scale,
        }
      )
    ) {
      if (this.hasWon) return;
      emit(GOAL_COLLISION);
      this.hasWon = true;
    }
  }
}
