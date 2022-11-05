export const BACK_FORTH = 'ew';
export const UP_DOWN = 'ns';

// Smooth(er)step, https://en.wikipedia.org/wiki/Smoothstep, (outputs number between 0 and 1)
const smoothstep = (min, max, x) => {
  let normalizedPosX = Math.max(0, Math.min(1, (x - min) / (max - min)));
  const smoothStep =
    normalizedPosX *
    normalizedPosX *
    normalizedPosX *
    (normalizedPosX * (normalizedPosX * 6 - 15) + 10);
  return smoothStep;
};

/**
 * If distance is -1, or 1, only move in one direction if the object has a behavior.
 */
export const moveBehavior = ({
  behavior,
  direction,
  distance,
  orgX,
  orgY,
  x,
  y,
  dt,
}) => {
  let axis = '';
  let multiplier = 1;
  let newDirection = direction;
  const westEdge = orgX - distance;
  const eastEdge = orgX + distance;
  const edgeOffset = 35; // smoothstep will never reach the edge, add offset to make the behavior change direction
  switch (behavior) {
    case UP_DOWN:
      axis = 'y';
      break;
    case BACK_FORTH:
      axis = 'x';
      break;
  }

  let smoothSpeed = smoothstep(westEdge, eastEdge, x);
  // swing between 0 and 0.5, making the center point 0.5, and the edges 0 (e.g [0 <-> 0.5 <-> 0])
  if (x > orgX) smoothSpeed = Math.abs(1 - smoothSpeed);

  switch (direction) {
    case 'n':
      multiplier = -1;
      break;
    case 's':
      multiplier = 1;
      break;
    case 'e':
      multiplier = 1;
      if (eastEdge - x < edgeOffset) {
        newDirection = 'w';
      }
      break;
    case 'w':
      multiplier = -1;
      if (x - westEdge < edgeOffset) {
        newDirection = 'e';
      }
      break;
  }

  smoothSpeed = smoothSpeed * multiplier * 5;

  return { axis, newDirection, smoothSpeed };
};

export const getDirection = (behavior, distance) => {
  let direction = '';
  if (distance < 0) {
    direction = behavior === BACK_FORTH ? 'w' : 'n';
  } else {
    direction = behavior === BACK_FORTH ? 'e' : 's';
  }
  return direction;
};
