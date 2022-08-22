import heart from 'data-url:./assets/img/heart.png';

import { emit, Sprite } from 'kontra';
import { HEART_PICKUP } from './gameEvents';
import { isBoxCollision } from './utils';

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
    this.createSprite();
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

  createSprite() {
    const image = new Image();
    image.src = heart;
    image.onerror = function (err) {
      console.log(err);
    };
    image.onload = () => {
      this.sprite = Sprite({
        x: this.x,
        y: this.y,
        anchor: { x: 0.5, y: 0.5 },
        width: 8,
        height: 8,
        image: image,
        scaleX: this.scale,
        scaleY: this.scale,
      });
    };
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
