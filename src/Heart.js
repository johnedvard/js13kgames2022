import heart from 'data-url:./assets/img/heart.png';

import { emit } from './kontra';
import { HEART_PICKUP } from './gameEvents';
import { createSprite, isBoxCollision } from './utils';
import { playPickup } from './sound';

export class Heart {
  scale = 4;
  width = 8;
  height = 8;
  x;
  y;
  sprite;
  idleSpeed = 0.1;
  direction = 'n';
  orgX;
  orgY;

  constructor(x, y, { level }) {
    this.orgX = x;
    this.orgY = y;
    this.level = level;
    this.x = x;
    this.y = y;
    createSprite({
      x: this.x,
      y: this.y,
      scale: this.scale,
      imgSrc: heart,
    }).then((sprite) => (this.sprite = sprite));
  }
  update() {
    if (!this.sprite) return;
    this.updateIdlePos();
    this.sprite.update();
    this.checkCollision();
  }
  updateIdlePos() {
    if (this.direction === 'n') {
      this.sprite.y -= this.idleSpeed;
      this.sprite.scaleY += this.idleSpeed / 10;
      this.sprite.scaleX += this.idleSpeed / 10;
      if (this.sprite.y <= this.orgY - 2) {
        this.direction = 's';
      }
    }
    if (this.direction === 's') {
      this.sprite.y += this.idleSpeed;
      this.sprite.scaleY -= this.idleSpeed / 10;
      this.sprite.scaleX -= this.idleSpeed / 10;
      if (this.sprite.y >= this.orgY + 2) {
        this.direction = 'n';
      }
    }
  }

  render(_ctx) {
    if (!this.sprite) return;
    this.sprite.render();
  }

  checkCollision() {
    if (
      isBoxCollision(
        {
          x: this.x - (this.width * this.scale) / 2,
          y: this.y - (this.height * this.scale) / 2,
          width: this.width * this.scale,
          height: this.height * this.scale,
        },
        this.level.player.sprite
      )
    ) {
      this.sprite = null;
      playPickup();
      emit(HEART_PICKUP, { heart: this });
    }
  }
}
