import { getDirection, moveBehavior, setBehavior } from './behavior';

export class Brick {
  x;
  y;
  level;
  width = 32;
  height = 32;
  speed = 1;
  constructor(x, y, { level, behavior, distance }) {
    this.direction = getDirection(behavior, distance);
    this.distance = Math.abs(distance);
    this.behavior = behavior;
    this.orgX = x;
    this.orgY = y;
    this.x = x;
    this.y = y;
    this.level = level;
  }

  getSmallCollisionBox() {
    return {
      x: this.x + 10,
      y: this.y + 10,
      width: 12,
      height: 12,
    };
  }
  update() {
    const { axis, newDirection, multiplier } = moveBehavior({
      behavior: this.behavior,
      distance: this.distance,
      direction: this.direction,
      x: this.x,
      y: this.y,
      orgX: this.orgX,
      orgY: this.orgY,
    });
    this.direction = newDirection;
    this[axis] += this.speed * multiplier;
  }

  render(ctx) {
    if (!ctx) return;
    ctx.lineWidth = 4;
    ctx.beginPath();

    ctx.rect(this.x, this.y, this.width, this.height); // Render collision box
    ctx.rect(this.x + 10, this.y + 10, 12, 12);
    ctx.stroke();
  }
}
