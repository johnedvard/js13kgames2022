import skull from './assets/img/skull.png';

import { getPointer, Sprite } from 'kontra';
import { PlayerControls } from './PlayerControls';
import { PointMass } from './PointMass';
import { RESTING_DISTANCE } from './constants';

export class Player {
  game;
  rope = []; // list of pointmasses
  pointMass; // used to attach to the end of the rope
  playerControls;
  sprite = { render: () => {} }; // draw sprite on pointmass position

  constructor(x, y, game) {
    this.game = game;
    this.pointMass = new PointMass(x, y, { game, mass: 2 });
    this.createRope();
    this.createSprite();
    this.playerControls = new PlayerControls(this);
  }

  updateRope() {
    this.rope.forEach((p) => {
      p.update();
    });
  }

  renderRope(ctx) {
    this.rope.forEach((p) => {
      p.render(ctx);
    });
  }

  createSprite() {
    const image = new Image();
    image.src = skull;
    image.onerror = function (err) {
      console.log(err);
    };
    image.onload = () => {
      this.sprite = Sprite({
        x: this.pointMass.x,
        y: this.pointMass.y,
        anchor: { x: 0.5, y: 0.5 },
        image: image,
        scaleX: 2,
        scaleY: 2,
      });
    };
  }

  createRope() {
    const anchor = new PointMass(this.game.canvas.width / 2, 100, {
      isAnchor: true,
      game: this.game,
    });
    this.rope.push(anchor);
    for (let i = 1; i < 8; i++) {
      const p1 = this.rope[this.rope.length - 1];
      const p2 = new PointMass(this.game.canvas.width / 2, i * 25 + 100, {
        game: this.game,
      });
      p1.attachTo(p2);
      this.rope.push(p2);
    }
    this.pointMass.x = this.rope[this.rope.length - 1];
    this.rope[this.rope.length - 1].attachTo(this.pointMass);
    this.rope.push(this.pointMass);
  }

  // Debug purpose only
  dragRope() {
    if (this.game.isDragging && this.rope.length) {
      const pointer = getPointer();
      const acnhorPoint = this.rope[this.rope.length - 1];
      acnhorPoint.setPos(pointer.x, pointer.y);
    }
  }

  renderPlayer(_ctx) {
    this.sprite.render();
  }

  applyForce(fX, fY) {
    this.pointMass.applyForce(fX, fY);
  }

  changePlayerDirection(isLeft) {
    if (isLeft) {
      this.sprite.scaleX = -2;
    } else {
      this.sprite.scaleX = 2;
    }
  }

  render(ctx) {
    this.renderRope(ctx);
    this.renderPlayer(ctx);
  }

  update() {
    this.sprite.x = this.pointMass.x;
    this.sprite.y = this.pointMass.y;

    this.updateRope();
    this.dragRope(); // TODO (johnedvard) Only enable in local and beta env
    this.playerControls.updateControls();
  }

  climbRope() {
    if (!this.rope || this.rope.length < 2) return;

    const lastPointMassWithLink = this.rope[this.rope.length - 2];
    lastPointMassWithLink.reduceRestingDistance(0.1);
    if (lastPointMassWithLink.restingDistance <= 0) {
      this.reArrangeRope();
    }
  }
  reArrangeRope() {
    this.rope.splice(this.rope.length - 2, 1);
    const newLastPointWithLink = this.rope[this.rope.length - 2];
    // undefined if last link was romved
    if (newLastPointWithLink) {
      newLastPointWithLink.removeLink();
      newLastPointWithLink.attachTo(this.pointMass);
    }
  }
  cutRope = (index) => {
    if (index >= this.rope.length - 1) index = this.rope.length - 2; // Make sure we can cut the rope if we pass the wrong index
    this.rope[index].removeLink();
  };
}
