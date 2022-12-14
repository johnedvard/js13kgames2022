export class Bubble {
  constructor() {}
  update() {}
  render(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.arc(100, 75, 50, 0, 2 * Math.PI);
    ctx.stroke();
  }
  init() {}
  isAlive() {
    return this.ttl >= 0;
  }
}

export function createBubble() {
  return new Bubble(...arguments);
}
