import { Vector } from './kontra';

import { acc } from './constants';
import { lineIntersection } from './utils';

export class BounceBoard {
  p1;
  p2;
  level;

  constructor({ p1, p2, level }) {
    this.p1 = Vector(p1.x, p1.y);
    this.p2 = Vector(p2.x, p2.y);
    this.level = level;
  }
  update() {
    this.handlePlayerCollision(this.level.player);
  }

  render(ctx) {
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = acc;
    // TODO (johnedvard) add bounce effect when hitting line
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);

    ctx.stroke();
    ctx.restore();
  }

  handlePlayerCollision(player) {
    const intersectionPoint = lineIntersection(
      this.p1,
      this.p2,
      player.oldPos,
      player.currPos
    );
    if (intersectionPoint) {
      player.oldPos = Vector(player.oldPos.x - 100, player.oldPos.y + 100);
      player.currPos = Vector(player.oldPos.x + 100, player.oldPos.y - 100);
    }
  }
}
