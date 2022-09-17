import { Vector } from 'kontra';

export class VerletNode {
  pos;
  oldPos;
  width = 2;
  height = 2;
  mass = 0.03;
  constructor({ x, y }) {
    this.pos = Vector(x, y);
    this.oldPos = Vector(x, y);
  }

  get x() {
    return this.pos.x;
  }
  get y() {
    return this.pos.y;
  }
  applyForce(fX, fY) {
    this.pos.x += fX;
    this.pos.y += fY;
  }
}
