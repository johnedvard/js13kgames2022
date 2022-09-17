import skull from 'data-url:./assets/img/skull.png';

import { Sprite, on, Vector, emit } from 'kontra';

import { PlayerControls } from './PlayerControls';
import { fgc2 } from './constants';
import {
  ARCADIAN_HEAD_SELECTED,
  CUT_ROPE,
  GOAL_COLLISION,
  PLAYER_DIED,
} from './gameEvents';
import { Rope } from './Rope';
import { gameHeight, getSelectedArcadian } from './store';
import { createSprite } from './utils';
import { getDirection, moveBehavior } from './behavior';
import { BubbleEffect } from './BubbleEffect';
import { PLAYER_ALIVE, PLAYER_DEAD } from './PlayerState';

export class Player {
  game;
  rope = [];
  playerControls;
  scale = 4;
  sprite = { render: () => {}, x: 0, y: 0 };
  headSprite = { render: () => {}, x: 0, y: 0 }; // From Arcadian API
  hasWon = false;
  hasSetListeners = false;
  headImg;
  headOffset = { x: 10, y: 38 };
  isLeft = false;
  isRopeCut = false;
  anchorNodeSpeed = 1;
  anchorNodeDirection;
  anchorNodeOrgPos;
  particleEffect;
  deadTimer = 0;
  deadInAirTimer = 0;
  deadLimit = 50;
  deadInAirLimit = 250;
  playerState = PLAYER_ALIVE;

  constructor({ game, levelData }) {
    levelData.p = levelData.p || {};
    this.levelData = levelData;
    this.anchorNodeDirection = getDirection(levelData.p.b, levelData.p.d);
    this.distance = Math.abs(levelData.p.d);
    this.behavior = levelData.p.b;
    this.game = game;
    const ropeLength = levelData.r;
    const startX = levelData.p.x;
    const startY = levelData.p.y;
    this.anchorNodeOrgPos = Vector(startX, startY);
    this.headImg = getSelectedArcadian().img || { width: 0, height: 0 };
    this.createRope({ startX, startY, ropeLength, levelData });
    createSprite({
      x: startX,
      y: startY,
      scale: this.scale,
      imgSrc: skull,
    }).then((sprite) => (this.sprite = sprite));
    this.createHeadSprite(this.headImg);
    this.playerControls = new PlayerControls(this);
    this.listenForGameEvents();
    this.particleEffect = new BubbleEffect();
  }

  updateRope() {
    if (this.hasWon) return;
    this.rope.update();
  }

  renderRope(ctx) {
    if (this.hasWon) return;
    this.rope.render(ctx);
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
    this.isRopeCut = false;
  }

  renderPlayer(_ctx) {
    this.sprite.render();
    this.headSprite.render();
  }

  applyForce(fX, fY) {
    // TODO (johnedvard) use a constant to make it more obvious and less prone to bug
    const isBoost = fY < -4;
    this.particleEffect.addBubbles({
      x: this.sprite.x,
      y: this.sprite.y,
      isBoost,
    });
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
    this.particleEffect.render(ctx);
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

    this.particleEffect.update();
    this.updateRope();
    this.updateAnchorNode();
    this.handlePlayerState();
    this.playerControls.updateControls();
  }

  handlePlayerState() {
    this.handleDeadOnGround();
    this.handleDeadInAir();
  }

  handleDeadOnGround() {
    if (this.playerState === PLAYER_DEAD) return;
    if (this.sprite.y >= gameHeight) {
      this.deadTimer += 1;
      if (this.deadTimer >= this.deadLimit) {
        this.handleDied();
      }
    }
  }
  handleDeadInAir() {
    if (this.hasWon) return;
    if (!this.isRopeCut || this.playerState === PLAYER_DEAD) return;
    this.deadInAirTimer += 1;
    if (this.deadInAirTimer >= this.deadInAirLimit) {
      this.handleDied();
    }
  }

  handleDied() {
    this.deadTimer = 0;
    this.deadInAirTimer = 0;
    this.playerState = PLAYER_DEAD;
    emit(PLAYER_DIED, {});
  }

  updateAnchorNode() {
    const anchorNode = this.rope.anchorNode;
    const { axis, newDirection, multiplier } = moveBehavior({
      behavior: this.behavior,
      distance: this.distance,
      direction: this.anchorNodeDirection,
      x: anchorNode.pos.x,
      y: anchorNode.pos.y,
      orgX: this.anchorNodeOrgPos.x,
      orgY: this.anchorNodeOrgPos.y,
    });
    this.anchorNodeDirection = newDirection;
    anchorNode.pos[axis] += this.anchorNodeSpeed * multiplier;
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
  respawnPlayer() {
    const ropeLength = this.levelData.r;
    const startX = this.levelData.p.x;
    const startY = this.levelData.p.y;
    this.anchorNodeDirection = getDirection(
      this.levelData.p.b,
      this.levelData.p.d
    );
    this.createRope({
      startX,
      startY,
      ropeLength,
      levelData: this.levelData,
    });
    this.playerState = PLAYER_ALIVE;
  }
  resetHearts() {}
  listenForGameEvents() {
    if (this.hasSetListeners) return;
    on(GOAL_COLLISION, this.onGoalCollision);
    on(ARCADIAN_HEAD_SELECTED, this.onArcadianAdded);
    on(CUT_ROPE, this.onCutRope);
    this.hasSetListeners = true;
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

  get currPos() {
    return this.rope.endNode.pos;
  }
  get oldPos() {
    return this.rope.endNode.oldPos;
  }

  set currPos(pos) {
    this.rope.endNode.currPos = pos;
  }
  set oldPos(pos) {
    this.rope.endNode.oldPos = pos;
  }
}
