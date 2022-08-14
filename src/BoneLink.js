/**
 * Link between two PointMasses
 */
export class BoneLink {
  restingDistance = 1;
  pointMassA;
  pointMassB;
  
  constructor(){

  }

  solveConstraint = (p1, p2) => {
    // calculate the distance
    const diffX = p1.x - p2.x;
    const diffY = p1.y - p2.y;
    const d = Math.sqrt(diffX * diffX + diffY * diffY);

    // difference scalar
    const difference = (this.restingDistance - d) / d;

    // translation for each PointMass. They'll be pushed 1/2 the required distance to match their resting distances.
    const translateX = diffX * 0.5 * difference;
    const translateY = diffY * 0.5 * difference;

    p1.x += translateX;
    p1.y += translateY;

    p2.x -= translateX;
    p2.y -= translateY;
  };
}
