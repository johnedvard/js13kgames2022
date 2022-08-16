/**
 * Link between two PointMasses
 */
export class BoneLink {
  restingDistance = 30;
  stiffness = 1;
  pointMassA;
  pointMassB;

  constructor(pointMassA, pointMassB) {
    this.pointMassA = pointMassA;
    this.pointMassB = pointMassB;
  }

  solveConstraint = () => {
    // calculate the distance between the two PointMasss
    const diffX = this.pointMassA.x - this.pointMassB.x;
    const diffY = this.pointMassA.y - this.pointMassB.y;
    const d = Math.sqrt(diffX * diffX + diffY * diffY);
    // find the difference, or the ratio of how far along the restingDistance the actual distance is.
    const difference = (this.restingDistance - d) / d;

    // Inverse the mass quantities
    const im1 = 1 / this.pointMassA.mass;
    const im2 = 1 / this.pointMassB.mass;
    const scalarP1 = (im1 / (im1 + im2)) * this.stiffness;
    const scalarP2 = this.stiffness - scalarP1;
    // console.log('scalarP1', scalarP1);
    // console.log('scalarP2', scalarP2);

    // Push/pull based on mass
    // heavier objects will be pushed/pulled less than attached light objects
    this.pointMassA.x += diffX * scalarP1 * difference;
    this.pointMassA.y += diffY * scalarP1 * difference;

    this.pointMassB.x -= diffX * scalarP2 * difference;
    this.pointMassB.y -= diffY * scalarP2 * difference;
  };
}
