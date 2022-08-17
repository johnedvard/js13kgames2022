import saw from './assets/img/saw.png';
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

  constructor(x, y, { behavior, distance }) {
    this.x = x;
    this.y = y;
    this.orgX = x;
    this.orgY = y;
    this.distance = distance;
    this.behavior = behavior;
    this.createSprite();
  }

  update() {
    this.moveDistance(this.behavior, this.distance);
    this.sprite.rotation += 5;
  }
  moveDistance(behavior, distance) {
    let axis = 'x';
    switch (behavior) {
      case UP_DOWN:
        axis = 'y';
        break;
      case BACK_FORTH:
        axis = 'x';
        break;
      default:
        axis = 'x';
    }

    this[axis] += this.speed;
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }
  render(_ctx) {
    this.sprite.render();
  }
  createSprite() {
    const image = new Image();
    image.src = saw;
    image.onerror = function (err) {
      console.log(err);
    };
    image.onload = () => {
      this.sprite = Sprite({
        x: this.x,
        y: this.y,
        anchor: { x: 0.5, y: 0.5 },
        image: image,
        scaleX: 2,
        scaleY: 2,
      });
    };
  }
}
