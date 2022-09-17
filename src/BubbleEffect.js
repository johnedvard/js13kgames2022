import { Pool, Sprite } from 'kontra';

import { fgc2 } from './constants';
import { playBubble } from './sound';

export class BubbleEffect {
  timeBetweenBubbles = 10;
  timeSinceLastBubble = 10;
  timeSinceLastBoostBubble = 10;
  constructor() {
    this.pool = Pool({
      // TODO (johnedvard) Figure out how to use custom object instead
      create: Sprite,
      maxSize: 20,
    });
  }
  render() {
    this.pool.render();
  }
  update() {
    this.timeSinceLastBubble += 1;
    this.timeSinceLastBoostBubble += 5;
    this.pool.update();
  }
  addBubbles({ x, y, isBoost }) {
    if (!isBoost && this.timeSinceLastBubble <= this.timeBetweenBubbles) return;
    if (isBoost && this.timeSinceLastBoostBubble <= this.timeBetweenBubbles) {
      return;
    }
    playBubble();
    this.timeSinceLastBubble = 0;
    this.timeSinceLastBoostBubble = 0;
    this.pool.get({
      // XXX (johnedvard) I don't know why, but we need to divide by 2. Must be some scaling issues
      x: x / 2,
      y: y / 2,
      width: 20,
      height: 40,
      color: fgc2,
      ttl: 50,
      render: function () {
        let size = 8;
        if (isBoost) size = 4;
        const ctx = this.context;
        ctx.lineWidth = 2;
        ctx.globalAlpha = this.ttl / 60;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, 2 * Math.PI);
        ctx.stroke();
      },
      update: function (dt) {
        this.ttl -= 1;
        this.x += Math.random() > 0.5 ? 1 : -1;
        this.y -= 1;
        if (isBoost && this.ttl > 30) {
          this.y += 2;
        } else if (isBoost) {
          this.y += 1.5;
        }
      },
    });
  }
}
