import { Vector } from 'kontra';
import { BoneLink } from './BoneLink';
import { gravity } from './constants';
import { fgc2, RESTING_DISTANCE } from './constants';
import { isBoxCollision, lineIntersection } from './utils';

export class PointMass {
  sprite; // TODO (johnedvard) maybe remove
  x;
  y;
  width = 4;
  height = 4;
  lastX;
  lastY;
  accX = 0;
  accY = 0;
  links = []; //list of BoneLinks (only one link per PointMass in the rope)
  anchorX;
  anchorY;
  mass = 1;
  game;
  level;
  restingDistance = RESTING_DISTANCE;

  constructor(x, y, { isAnchor, game, mass }) {
    this.game = game;
    this.level = game.level;
    this.x = x;
    this.y = y;
    this.lastX = x;
    this.lastY = y;
    this.mass = mass || 1;
    if (isAnchor) {
      this.anchorX = x;
      this.anchorY = y;
    }
  }

  setPos(x, y) {
    this.x = x;
    this.y = y;
    this.lastX = x;
    this.lastY = y;
    if (this.isAnchor()) {
      this.anchorX = x;
      this.anchorY = y;
    }
  }

  reduceRestingDistance(factor) {
    this.links.forEach((l) => {
      l.reduceRestingDistance(factor);
      this.restingDistance = l.restingDistance;
    });
  }

  isAnchor() {
    return this.anchorX !== undefined || this.anchorX !== undefined;
  }

  // attachTo can be used to create links between this PointMass and other PointMasss
  attachTo(pointMass) {
    const link = new BoneLink(this, pointMass);
    this.links.push(link);
  }

  removeLink() {
    this.links.length = 0;
  }

  render(ctx) {
    if (!ctx) return;
    ctx.lineWidth = 4;
    ctx.strokeStyle = fgc2;

    ctx.beginPath();
    this.links.forEach((link) => {
      ctx.moveTo(link.pointMassA.x, link.pointMassA.y);
      ctx.lineTo(link.pointMassB.x, link.pointMassB.y);
    });
    ctx.stroke();
  }

  update() {
    this.solveConstraints();
    this.updatePhysics();
  }
  updatePhysics() {
    if (this.y >= this.game.canvas.height - 3) return; // prevent humping on floor
    this.applyForce(0, this.mass * gravity);

    let velX = this.x - this.lastX;
    let velY = this.y - this.lastY;

    // dampen velocity
    velX *= 0.99;
    velY *= 0.99;

    // const timeStepSq = timeStep * timeStep;
    const timeStepSq = 1;

    // calculate the next position using Verlet Integration
    const nextX = this.x + velX + 0.5 * this.accX * timeStepSq;
    const nextY = this.y + velY + 0.5 * this.accY * timeStepSq;

    // reset variables
    this.lastX = this.x;
    this.lastY = this.y;

    this.x = nextX;
    this.y = nextY;

    this.accX = 0;
    this.accY = 0;
  }

  applyForce(fX, fY) {
    this.accX += fX / this.mass;
    this.accY += fY / this.mass;
  }

  solveConstraints() {
    if (!this.game.canvas) return;
    this.links.forEach((link) => {
      link.solveConstraint();
    });

    /* Boundary Constraints */
    // These if statements keep the PointMasss within the screen
    if (this.y < 1) this.y = 2 - this.y;
    if (this.y > this.game.canvas.height - 1)
      this.y = 2 * (this.game.canvas.height - 1) - this.y;

    if (this.x < 1) this.x = 2 - this.x;
    if (this.x > this.game.canvas.width - 1)
      this.x = 2 * (this.game.canvas.width - 1) - this.x;

    /* Other Constraints */
    // make sure the PointMass stays in its place if it's pinned
    if (this.isAnchor()) {
      this.x = this.anchorX;
      this.y = this.anchorY;
      return;
    }

    /* Collision on boxes */

    const bricks = this.level.bricks;
    bricks.forEach((b) => {
      // check left edge
      if (this.links.length) {
        const pointB = this.links[0].pointMassB;
        if (
          // hit left edge
          lineIntersection(
            { x: b.x - 2, y: b.y },
            { x: b.x - 2, y: b.y + b.height },
            { x: this.x, y: this.y },
            { x: pointB.x, y: pointB.y }
          )
        ) {
          this.x = b.x - 2;
        }
        // hit top edge
        if (
          lineIntersection(
            { x: b.x, y: b.y - 2 },
            { x: b.x + b.width, y: b.y - 2 },
            { x: this.x, y: this.y },
            { x: pointB.x, y: pointB.y }
          )
        ) {
          this.y = b.y - 2;
        }
        // hit right edge
        if (
          lineIntersection(
            { x: b.x + b.width + 2, y: b.y },
            { x: b.x + b.width + 2, y: b.y + b.height },
            { x: this.x, y: this.y },
            { x: pointB.x, y: pointB.y }
          )
        ) {
          this.x = b.x + b.width + 2;
        }
        // hit bottom edge
        if (
          lineIntersection(
            { x: b.x, y: b.y + b.height + 2 },
            { x: b.x + b.width, y: b.y + b.height + 2 },
            { x: this.x, y: this.y },
            { x: pointB.x, y: pointB.y }
          )
        ) {
          this.y = b.y + b.height + 2;
        }
      }
    });
  }
}
