import { emit, Vector } from './kontra';

import { fgc2, gravity, RESTING_DISTANCE } from './constants';
import { CUT_ROPE } from './gameEvents';
import { gameHeight, gameWidth } from './store';
import { isBoxCollision } from './utils';
import { VerletLink } from './VerletLink';
import { VerletNode } from './VerletNode';

export class Rope {
  nodes = [];
  links = [];
  anchor;
  iterations = 20;

  constructor({ x, y, numNodes, level }) {
    this.level = level;
    this.anchor = Vector(x, y);
    for (let i = 0; i < numNodes; i++) {
      this.nodes.push(
        new VerletNode({
          x,
          y: i * RESTING_DISTANCE + y,
        })
      );
    }

    for (let i = 0; i < this.nodes.length - 1; i++) {
      const n1 = this.nodes[i];
      const n2 = this.nodes[i + 1];
      this.links.push(new VerletLink(n1, n2));
    }
  }

  update() {
    this.updateNodes();
    for (let i = 0; i < this.iterations; i++) {
      // Add more iterations to make the rope more stiff
      this.updateLinks();
      this.constrainNodes();
    }
  }
  render(ctx) {
    if (!ctx) return;
    this.renderRope(ctx);
  }
  updateNodes() {
    this.nodes.forEach((n) => {
      if (n === this.nodes[0]) n.pos = this.anchor;
      const vxy = n.pos.subtract(n.oldPos);
      n.oldPos = n.pos;
      n.pos = n.pos.add(vxy).add(Vector(0, gravity * n.mass));
    });
  }
  constrainNodes() {
    this.nodes.forEach((n) => {
      if (n === this.nodes[0]) n.pos = this.anchor;
      this.handleWallCollision(n);
      this.handleBoxCollision(n);
    });
  }
  updateLinks() {
    this.links.forEach((l) => {
      const dxy = l.n2.pos.subtract(l.n1.pos);
      const distance = dxy.length();
      const diff = l.restingDistance - distance;
      const percent = diff / distance / 2;
      const offset = Vector(dxy.x * percent, dxy.y * percent);
      l.n1.pos = l.n1.pos.subtract(offset);
      l.n2.pos = l.n2.pos.add(offset);
    });
  }

  renderRope(ctx) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = fgc2;

    ctx.beginPath();
    this.links.forEach((l) => {
      ctx.moveTo(l.n1.x, l.n1.y);
      ctx.lineTo(l.n2.x, l.n2.y);
    });

    ctx.stroke();
  }

  handleWallCollision(node) {
    if (node.x > gameWidth) {
      node.pos.x = gameWidth;
    }
    if (node.x < 0) {
      node.pos.x = 0;
    }
    if (node.y > gameHeight) {
      node.pos.y = gameHeight;
    }
    if (node.y < 0) {
      node.pos.y = 0;
    }
  }
  handleBoxCollision(node, vxy) {
    if (node === this.nodes[0]) return;
    const bricks = this.level.bricks;
    bricks.forEach((b) => {
      // check left edge
      if (isBoxCollision(b, node)) {
        Math.max();
        const left = Math.abs(node.pos.x - b.x);
        const right = Math.abs(node.pos.x - (b.x + b.width));
        const top = Math.abs(node.pos.y - b.y);
        const bot = Math.abs(node.pos.y - (b.y + b.height));
        // hhit left wall
        const max = Math.max(left, right, top, bot);

        if (max === right) {
          node.pos.x = b.x - 3;
        } else if (max === left) {
          node.pos.x = b.x + b.width + 3;
        } else if (max === bot) {
          node.pos.y = b.y - 3;
        } else if (max === top) {
          node.pos.y = b.y + b.height + 3;
        }
      }
    });
  }
  climbRope() {
    if (!this.nodes || this.nodes.length <= 2) {
      this.cutRope(0);
      return;
    }

    const factor = 0.3;
    const lastLink = this.links[this.links.length - 1];
    lastLink.restingDistance -= RESTING_DISTANCE * factor;
    if (lastLink.restingDistance <= 0) {
      this.links.pop();
      this.nodes.pop();
    }
  }
  cutRope(index) {
    if (index >= this.nodes.length - 1) index = this.nodes.length - 2; // Make sure we can cut the rope if we pass the wrong index
    this.links.splice(index, 1);
    emit(CUT_ROPE, { rope: this });
  }

  get length() {
    return this.nodes.length;
  }

  get endNode() {
    return this.nodes[this.nodes.length - 1];
  }

  get anchorNode() {
    if (!this.nodes.length) return {};
    return this.nodes[0];
  }
}
