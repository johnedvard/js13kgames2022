import heart from 'data-url:./assets/img/heart.png';

import { emit } from './kontra';
import { HEART_PICKUP } from './gameEvents';
import { createSprite, isBoxCollision } from './utils';

export class Heart {
  scale = 4;
  width = 8;
  height = 8;
  x;
  y;
  sprite;

  constructor(x, y, { level }) {
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
    this.sprite.update();
    this.checkCollision();
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
      emit(HEART_PICKUP, { heart: this });
    }
  }
}
