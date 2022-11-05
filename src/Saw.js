import saw2 from 'data-url:./assets/img/saw3.png';

import { moveBehavior, getDirection } from './behavior';
import { createSprite } from './utils';

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
  width = 8;
  height = 8;
  level;

  constructor(x, y, { behavior, distance, level }) {
    this.direction = getDirection(behavior, distance);
    this.distance = Math.abs(distance);
    this.behavior = behavior;
    this.x = x;
    this.y = y;
    this.orgX = x;
    this.orgY = y;
    this.level = level;
    createSprite({
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      scale: this.scale,
      imgSrc: saw2,
    }).then((sprite) => (this.sprite = sprite));
  }

  update() {
    const { axis, newDirection, smoothSpeed } = moveBehavior({
      behavior: this.behavior,
      distance: this.distance,
      direction: this.direction,
      x: this.x,
      y: this.y,
      orgX: this.orgX,
      orgY: this.orgY,
    });
    this.direction = newDirection;
    this[axis] += this.speed * smoothSpeed;
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.rotation += this.rotSpeed;
  }
  render(_ctx) {
    this.sprite.render();
  }
}
