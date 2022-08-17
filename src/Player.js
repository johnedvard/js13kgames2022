import skull from './assets/img/skull.png';

import { getPointer, Sprite } from 'kontra';
import { PlayerControls } from './PlayerControls';
import { PointMass } from './PointMass';

export class Player {
  x;
  y;
  game;
  rope = []; // list of pointmasses
  pointMass;
  playerControls;
  sprite = { render: () => {} };

  constructor(x, y, game) {
    this.x = x;
    this.y = y;
    this.game = game;
    this.pointMass = new PointMass(x, y, { game, mass: 2 });
    this.createRope();
    this.createSprite();
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
    this.createRope();
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
        x: this.x,
        y: this.y,
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
    for (let i = 1; i < 7; i++) {
      const p1 = this.rope[this.rope.length - 1];
      const p2 = new PointMass(i * 10, i * 10, { game: this.game });
      p1.attachTo(p2);
      this.rope.push(p2);
    }
    this.pointMass.attachTo(this.rope[this.rope.length - 1]);
    this.rope.push(this.pointMass);
  }

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
    this.x = this.pointMass.x;
    this.y = this.pointMass.y;

    this.sprite.x = this.pointMass.x;
    this.sprite.y = this.pointMass.y;

    this.updateRope();
    this.dragRope();
    this.playerControls.updateControls();
  }

  cutRope = (index) => {
    this.rope[index].removeLink();
  };
  toggleRope = (e) => {
    // TODO (johnedvard) Maybe use state machine
    if (this.hasRope()) {
      this.removeRope();
    } else {
      this.shootRope();
    }
  };
}
