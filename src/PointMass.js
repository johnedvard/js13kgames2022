import { BoneLink } from './BoneLink';

export class PointMass {
  sprite; // TODO (johnedvard) maybe remove
  x;
  y;
  lastX;
  lastY;
  accX = 0;
  accY = 0;
  links = []; //list of BoneLinks (only one link per PointMass in the rope)
  anchorX;
  anchorY;
  mass = 1;

  constructor(x, y, isAnchor) {
    this.x = x;
    this.y = y;
    this.lastX = x;
    this.lastY = y;
    console.log('this', this);
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

  isAnchor() {
    return this.anchorX !== undefined || this.anchorX !== undefined;
  }

  // attachTo can be used to create links between this PointMass and other PointMasss
  attachTo(pointMass) {
    const link = new BoneLink(this, pointMass);
    this.links.push(link);
  }

  removeLink(link) {
    this.links.remove(link);
  }

  render(ctx) {
    if (!ctx) return;
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    this.links.forEach((link) => {
      ctx.lineTo(link.pointMassB.x, link.pointMassB.y);
    });
    ctx.stroke();
  }

  update() {
    this.solveConstraints();
    this.updatePhysics();
  }
  updatePhysics() {
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

  solveConstraints() {
    this.links.forEach((link) => {
      link.solveConstraint();
    });

    /* Other Constraints */
    // make sure the PointMass stays in its place if it's pinned
    if (this.isAnchor()) {
      this.x = this.anchorX;
      this.y = this.anchorY;
    }
  }
}
