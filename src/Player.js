import skull from 'data-url:./assets/img/skull.png';

import { getPointer, Sprite, on } from 'kontra';
import { PlayerControls } from './PlayerControls';
import { PointMass } from './PointMass';
import { fgc2, RESTING_DISTANCE } from './constants';
import { ARCADIAN_ADDED, GOAL_COLLISION } from './gameEvents';

export class Player {
  game;
  rope = []; // list of pointmasses
  pointMass; // used to attach to the end of the rope
  playerControls;
  scale = 4;
  sprite = { render: () => {}, x: 0, y: 0 }; // draw sprite on pointmass position
  headSprite = { render: () => {}, x: 0, y: 0 }; // From Arcadian API
  hasWon = false;
  headImg = { width: 0, height: 0 };
  headOffset = { x: 10, y: 38 };
  isLeft = false;
  isRopeCut = false;

  constructor({ game, levelData }) {
    this.game = game;
    const ropeLength = levelData.r;
    const startX = levelData.p.x;
    const startY = levelData.p.y;
    this.pointMass = new PointMass(
      startX,
      startY + ropeLength * RESTING_DISTANCE,
      { game, mass: 2 }
    );
    this.createRope({ startX, startY, ropeLength });
    this.createSprite();
    this.playerControls = new PlayerControls(this);
    this.listenForGameEvents();
  }

  updateRope() {
    if (this.hasWon) return;
    this.rope.forEach((p) => {
      p.update();
    });
  }

  renderRope(ctx) {
    if (this.hasWon) return;
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
        width: 8,
        height: 8,
        image: image,
        scaleX: this.scale,
        scaleY: this.scale,
      });
    };
  }
  createHeadSprite(img) {
    const scale = this.scale / 2;
    let scaleX = scale;
    if (this.isLeft) scaleX = scaleX * -1;
    this.headSprite = Sprite({
      x: this.pointMass.x - img.width,
      y: this.pointMass.y - img.height,
      anchor: { x: 0.5, y: 0.5 },
      width: 8,
      height: 8,
      image: img,
      scaleX: scaleX,
      scaleY: scale,
    });
  }

  createRope({ startX, startY, ropeLength }) {
    const anchor = new PointMass(startX, startY, {
      isAnchor: true,
      game: this.game,
    });
    this.rope.push(anchor);
    for (let i = 1; i < ropeLength; i++) {
      const p1 = this.rope[this.rope.length - 1];
      const p2 = new PointMass(startX, i * RESTING_DISTANCE + startY, {
        game: this.game,
      });
      p1.attachTo(p2);
      this.rope.push(p2);
    }
    // make player's pointmass attach to the rope
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
    this.headSprite.render();
  }

  applyForce(fX, fY) {
    this.pointMass.applyForce(fX, fY);
  }

  changePlayerDirection(isLeft) {
    this.isLeft = isLeft;
    if (isLeft) {
      this.sprite.scaleX = -this.scale;
      this.headSprite.scaleX = -this.scale / 2;
    } else {
      this.sprite.scaleX = this.scale;
      this.headSprite.scaleX = this.scale / 2;
    }
    // prevent headpiece from flashing
    this.headSprite.x =
      this.sprite.x -
      (this.headImg.width - this.headOffset.x) * Math.sign(this.sprite.scaleX);
  }

  render(ctx) {
    this.renderRope(ctx);
    this.renderPlayer(ctx);
    // this.renderCollisionBox(ctx);
  }

  renderCollisionBox(ctx) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = fgc2;
    ctx.beginPath();
    ctx.rect(
      this.sprite.x,
      this.sprite.y,
      this.sprite.width * this.scale,
      this.sprite.height * this.scale
    );
    ctx.stroke();
  }

  update() {
    this.sprite.x = this.pointMass.x;
    this.sprite.y = this.pointMass.y;
    this.headSprite.x =
      this.pointMass.x -
      (this.headImg.width - this.headOffset.x) * Math.sign(this.sprite.scaleX);

    this.headSprite.y =
      this.pointMass.y - this.headImg.height + +this.headOffset.y;

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
    this.isRopeCut = true;
    this.rope[index].removeLink();
  };

  listenForGameEvents() {
    on(GOAL_COLLISION, this.onGoalCollision);
    on(ARCADIAN_ADDED, this.onArcadianAdded);
  }
  onGoalCollision = () => {
    this.hasWon = true;
  };
  onArcadianAdded = ({ img }) => {
    this.headImg = img;
    this.createHeadSprite(img);
  };
}
