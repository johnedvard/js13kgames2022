import { getPointer } from 'kontra';
import { PlayerControls } from './PlayerControls';
import { PointMass } from './PointMass';

export class Player {
  x;
  y;
  game;
  rope = []; // list of pointmasses
  pointMass;
  playerControls;

  constructor(x, y, game) {
    this.x = x;
    this.y = y;
    this.game = game;
    this.pointMass = new PointMass(x, y, { game, mass: 2 });
    this.createTestRope();
    this.playerControls = new PlayerControls(this);
  }

  hasRope() {
    return !!this.rope.length;
  }
  removeRope() {
    this.pointMass.removeLink();
    this.rope.length = 0;
  }
  shootRope() {
    this.createTestRope();
  }
  updateTestRope() {
    this.rope.forEach((p) => {
      p.update();
    });
  }

  renderTestRope(ctx) {
    this.rope.forEach((p) => {
      p.render(ctx);
    });
  }

  createTestRope() {
    const anchor = new PointMass(this.game.canvas.width / 2, 100, {
      isAnchor: true,
      game: this.game,
    });
    this.rope.push(anchor);
    for (let i = 1; i < 7; i++) {
      const p1 = this.rope[this.rope.length - 1];
      const p2 = new PointMass(i * 10, i * 10, { game: this.game });
      p1.attachTo(p2);
      this.rope.push(p2);
    }
    this.pointMass.attachTo(this.rope[this.rope.length - 1]);
    this.rope.push(this.pointMass);
  }

  dragTestRope() {
    if (this.game.isDragging && this.rope.length) {
      const pointer = getPointer();
      const acnhorPoint = this.rope[this.rope.length - 1];
      acnhorPoint.setPos(pointer.x, pointer.y);
    }
  }

  renderPlayer(ctx) {
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  applyForce(fX, fY) {
    this.pointMass.applyForce(fX, fY);
  }

  render(ctx) {
    this.renderTestRope(ctx);
    this.renderPlayer(ctx);
  }

  update() {
    this.x = this.pointMass.x;
    this.y = this.pointMass.y;
    this.updateTestRope();
    this.dragTestRope();
    this.playerControls.updateControls();
  }
}
