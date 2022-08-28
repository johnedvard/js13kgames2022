import saw2 from 'data-url:./assets/img/saw3.png';

import { Sprite } from 'kontra';
import { BACK_FORTH, UP_DOWN } from './sawBehavior';

export class Saw {
  x;
  y;
  orgX;
  orgY;
  sprite = { render: () => {} };
  distance = 100;
  speed = 1;
  scale = 4;
  rotSpeed = 0.2;
  level;
  direction = 'e'; // n,s,e,w

  constructor(x, y, { behavior, distance, level }) {
    this.x = x;
    this.y = y;
    this.orgX = x;
    this.orgY = y;
    this.distance = 200;
    this.behavior = behavior;
    this.level = level;
    this.createSprite();
  }

  update() {
    this.moveDistance(this.behavior, this.distance);
  }
  moveDistance(behavior, distance) {
    let axis = '';
    let multiplier = 1;
    switch (behavior) {
      case UP_DOWN:
        axis = 'y';
        break;
      case BACK_FORTH:
        axis = 'x';
        break;
      default:
    }

    switch (this.direction) {
      case 'n':
        multiplier = -1;
        break;
      case 's':
        multiplier = 1;
        break;
      case 'e':
        multiplier = 1;
        if (this.orgX + distance < this.x) {
          this.direction = 'w';
        }
        break;
      case 'w':
        multiplier = -1;
        if (this.orgX - distance > this.x) {
          this.direction = 'e';
        }
        break;
    }
    this[axis] += this.speed * multiplier;
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.rotation += this.rotSpeed * multiplier;
  }
  render(_ctx) {
    this.sprite.render();
  }
  createSprite() {
    const image = new Image();
    image.src = saw2;
    image.onerror = function (err) {
      console.log(err);
    };
    image.onload = () => {
      this.sprite = Sprite({
        x: this.x,
        y: this.y,
        image: image,
        scaleX: this.scale,
        anchor: { x: 0.5, y: 0.5 },
        scaleY: this.scale,
      });
    };
  }
}
