export class Brick {
  x;
  y;
  level;
  width = 32;
  height = 32;
  constructor(x, y, { level }) {
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
  update() {}

  render(ctx) {
    if (!ctx) return;
    ctx.lineWidth = 4;
    ctx.beginPath();

    ctx.rect(this.x, this.y, this.width, this.height); // Render collision box
    ctx.rect(this.x + 10, this.y + 10, 12, 12);
    ctx.stroke();
  }
}
