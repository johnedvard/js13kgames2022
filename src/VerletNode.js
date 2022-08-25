import { Vector } from 'kontra';

export class VerletNode {
  pos;
  oldPos;
  width = 5;
  height = 5;
  constructor({ x, y }) {
    this.pos = Vector(x, y);
    console.log(this.pos);
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