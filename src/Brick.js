import { getDirection, moveBehavior, setBehavior } from './behavior';

export class Brick {
  x;
  y;
  level;
  width = 32;
  height = 32;
  speed = 1;
  phase = 1 - Math.random() * 2;
  waveDir = 1;
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
  update(dt) {
    const { axis, newDirection, smoothSpeed } = moveBehavior({
      behavior: this.behavior,
      distance: this.distance,
      direction: this.direction,
      x: this.x,
      y: this.y,
      orgX: this.orgX,
      orgY: this.orgY,
      dt,
    });
    this.direction = newDirection;
    this[axis] += this.speed * smoothSpeed;
    this.updateWaterBlur(dt);
  }
  updateWaterBlur(dt) {
    if (this.phase <= -2) {
      this.waveDir = 1;
    } else if (this.phase >= 2) {
      this.waveDir = -1;
    }
    this.phase += dt * this.waveDir * 3;
  }

  render(ctx) {
    if (!ctx) return;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.quadraticCurveTo(
      this.x + this.phase * 2,
      this.y + this.height / 4 + Math.abs(this.phase * 5),
      this.x,
      this.y + this.height
    );
    ctx.moveTo(this.x + this.width, this.y);
    ctx.quadraticCurveTo(
      this.x + +this.width + this.phase * 2,
      this.y + this.height / 4 + Math.abs(this.phase * 5),
      this.x + this.width,
      this.y + this.height
    );
    ctx.moveTo(this.x + this.phase / 5, this.y);
    ctx.lineTo(this.x + this.phase / 5 + this.width, this.y);
    ctx.moveTo(this.x + this.phase / 5, this.y + this.height);
    ctx.lineTo(this.x + this.phase / 5 + this.width, this.y + this.height);

    // ctx.rect(this.x, this.y, this.width, this.height); // Render collision box
    // ctx.rect(this.x + 10 + this.phase / 5, this.y + 10, 12, 12);
    ctx.stroke();
  }
}
