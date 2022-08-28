import skull from 'data-url:./assets/img/skull.png';

import { getPointer, Sprite, on } from 'kontra';
import { PlayerControls } from './PlayerControls';
import { fgc2 } from './constants';
import { ARCADIAN_HEAD_SELECTED, CUT_ROPE, GOAL_COLLISION } from './gameEvents';
import { Rope } from './Rope';
import { getSelectedArcadian } from './store';

export class Player {
  game;
  rope = []; // list of pointmasses
  playerControls;
  scale = 4;
  sprite = { render: () => {}, x: 0, y: 0 }; // draw sprite on pointmass position
  headSprite = { render: () => {}, x: 0, y: 0 }; // From Arcadian API
  hasWon = false;
  headImg;
  headOffset = { x: 10, y: 38 };
  isLeft = false;
  isRopeCut = false;

  constructor({ game, levelData }) {
    this.game = game;
    const ropeLength = levelData.r;
    const startX = levelData.p.x;
    const startY = levelData.p.y;
    this.headImg = getSelectedArcadian().img || { width: 0, height: 0 };
    this.createRope({ startX, startY, ropeLength });
    this.createSprite();
    this.createHeadSprite(this.headImg);
    this.playerControls = new PlayerControls(this);
    this.listenForGameEvents();
  }

  updateRope() {
    if (this.hasWon) return;
    this.rope.update();
  }

  renderRope(ctx) {
    if (this.hasWon) return;
    this.rope.render(ctx);
  }

  createSprite() {
    const image = new Image();
    image.src = skull;
    image.onerror = function (err) {
      console.log(err);
    };
    image.onload = () => {
      this.sprite = Sprite({
        x: this.rope.endNode.x,
        y: this.rope.endNode.y,
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
    if (!img.width || !img.height) return;
    const scale = this.scale / 2;
    let scaleX = scale;
    if (this.isLeft) scaleX = scaleX * -1;
    this.headSprite = Sprite({
      x: this.rope.endNode.x - img.width,
      y: this.rope.endNode.y - img.height,
      anchor: { x: 0.5, y: 0.5 },
      width: 8,
      height: 8,
      image: img,
      scaleX: scaleX,
      scaleY: scale,
    });
  }

  createRope({ startX, startY, ropeLength }) {
    this.rope = new Rope({
      x: startX,
      y: startY,
      numNodes: ropeLength,
      level: this.game.level,
    });
  }

  // Debug purpose only
  dragRope() {
    if (this.game.isDragging && this.rope.length) {
      const pointer = getPointer();
      const acnhorPoint = this.rope.nodes[0];
      acnhorPoint.pos.x = pointer.x;
      acnhorPoint.pos.y = pointer.y;
    }
  }

  renderPlayer(_ctx) {
    this.sprite.render();
    this.headSprite.render();
  }

  applyForce(fX, fY) {
    this.rope.endNode.applyForce(fX, fY);
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
    this.sprite.x = this.rope.endNode.pos.x;
    this.sprite.y = this.rope.endNode.pos.y;
    this.headSprite.x =
      this.rope.endNode.pos.x -
      (this.headImg.width - this.headOffset.x) * Math.sign(this.sprite.scaleX);

    this.headSprite.y =
      this.rope.endNode.pos.y - this.headImg.height + +this.headOffset.y;

    this.updateRope();
    // this.dragRope(); // TODO (johnedvard) Only enable in local and beta env
    this.playerControls.updateControls();
  }

  climbRope() {
    this.rope.climbRope();
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

  listenForGameEvents() {
    on(GOAL_COLLISION, this.onGoalCollision);
    on(ARCADIAN_HEAD_SELECTED, this.onArcadianAdded);
    on(CUT_ROPE, this.onCutRope);
  }
  onGoalCollision = () => {
    this.hasWon = true;
  };
  onArcadianAdded = ({ img }) => {
    this.headImg = img;
    this.createHeadSprite(img);
  };
  onCutRope = ({ rope }) => {
    this.isRopeCut = true;
  };
}
