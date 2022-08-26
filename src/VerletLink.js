import { RESTING_DISTANCE } from './constants';

export class VerletLink {
  n1;
  n2;
  restingDistance = RESTING_DISTANCE;
  constructor(n1, n2) {
    this.n1 = n1;
    this.n2 = n2;
  }
}
