import { initPointer, onPointer, init, getPointer, GameLoop } from 'kontra';
import { PointMass } from './PointMass';

export class Game {
  rope = []; // list of pointmasses
  constructor() {
    const game = this;
    let { canvas, context } = init();
    initPointer();
    this.createTestRope();
    let loop = GameLoop({
      update: function () {
        game.updateTestRope();
        game.dragTestRope();
      },
      render: function () {
        game.renderTestRope(context);
      },
    });
    loop.start(); // start the game
    this.addPointerListeners();
  }

  dragTestRope() {
    if (this.isDragging && this.rope.length) {
      const pointer = getPointer();
      const acnhorPoint = this.rope[0];
      acnhorPoint.setPos(pointer.x, pointer.y);
    }
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
    const anchor = new PointMass(0, 0, true);
    this.rope.push(anchor);
    for (let i = 1; i < 10; i++) {
      const p1 = this.rope[this.rope.length - 1];
      const p2 = new PointMass(i * 10, i * 10);
      p1.attachTo(p2);
      this.rope.push(p2);
    }
    console.log('created rope', this.rope);
  }

  addPointerListeners() {
    onPointer('down', () => {
      this.isDragging = true;
    });
    onPointer('up', () => {
      this.isDragging = false;
    });
  }
}
