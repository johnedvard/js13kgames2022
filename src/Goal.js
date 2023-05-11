import swirl from 'data-url:./assets/img/swirl-medium.png';

import { emit } from 'kontra';

import { createSprite, isBoxCollision } from './utils';
import { GOAL_COLLISION, LEVEL_COMPLETE } from './gameEvents';
import { playGoal } from './sound';

export class Goal {
  level;
  scale = 1;
  width = 48;
  height = 48;
  originalRadius = { x: 15, y: 30 };
  radiusX = 15;
  radiusY = 30;
  hasWon = false;
  hasVanished = false;
  vanishSpeed = 0.3;
  isVanishihng = false;
  sprite;

  constructor(x, y, { level }) {
    this.x = x; // make up for size adjustment to swirl
    this.y = y;
    this.level = level;
    createSprite({
      x: x + 24,
      y: y + 24,
      scale: 1.33,
      imgSrc: swirl,
      width: this.width,
      height: this.height,
      anchor: { x: 0.5, y: 0.5 },
    }).then((sprite) => (this.sprite = sprite));
  }
  update(dt) {
    if (this.hasVanished || !this.sprite) return;
    this.checkCollision();
    this.sprite.rotation += dt * 4;
  }
  render(ctx) {
    if (!this.sprite || !ctx || this.hasVanished) return;
    this.sprite.render(ctx);

    if (this.hasWon) {
      this.startVanishing();
    }

    // ctx.ellipse(
    //   this.x + this.width / 2,
    //   this.y + this.height / 2,
    //   this.radiusX,
    //   this.radiusY,
    //   Math.PI / 2,
    //   0,
    //   Math.PI * 2
    // );
    //this.renderCollisionBox(ctx);
  }
  renderCollisionBox(ctx) {
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
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
        {
          x:
            this.level.player.sprite.x -
            (this.level.player.sprite.height * this.level.player.scale) / 2, // make up for scaling
          y:
            this.level.player.sprite.y -
            (this.level.player.sprite.width * this.level.player.scale) / 2,
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
