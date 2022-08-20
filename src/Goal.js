import { Sprite } from 'kontra';

import { isBoxCollision } from './utils';
import grave from './assets/img/grave-4x-mini.png';

export class Goal {
  level;
  sprite;
  scale = 2;
  constructor(x, y, { level }) {
    this.x = x;
    this.y = y;
    this.level = level;
    this.createSprite();
  }
  update() {
    this.checkCollision();
    if (this.sprite) {
      this.sprite.update();
    }
  }
  render() {
    if (this.sprite) {
      this.sprite.render();
    }
  }

  checkCollision() {
    if (isBoxCollision(this.sprite, this.level.player.sprite)) {
      console.log('collided');
    }
  }

  createSprite() {
    const image = new Image();
    image.src = grave;
    image.onerror = function (err) {
      console.log(err);
    };
    image.onload = () => {
      this.sprite = Sprite({
        x: this.x,
        y: this.y,
        width: 32,
        height: 32,
        image: image,
        scaleX: this.scale,
        scaleY: this.scale,
      });
    };
  }
}
