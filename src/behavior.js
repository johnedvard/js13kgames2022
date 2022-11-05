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
  const northEdge = orgY - distance;
  const southEdge = orgY + distance;
  const edgeOffset = 35; // smoothstep will never reach the edge, add offset to make the behavior change direction
  switch (behavior) {
    case UP_DOWN:
      axis = 'y';
      break;
    case BACK_FORTH:
      axis = 'x';
      break;
  }

  let smoothSpeed = {
    x: smoothstep(westEdge, eastEdge, x),
    y: smoothstep(northEdge, southEdge, y),
  };

  switch (direction) {
    case 'n':
      multiplier = -1;
      if (smoothSpeed.y < 0.05) {
        newDirection = 's';
      }
      break;
    case 's':
      multiplier = 1;
      if (smoothSpeed.y > 0.95) {
        newDirection = 'n';
      }
      break;
    case 'e':
      multiplier = 1;
      if (smoothSpeed.x > 0.95) {
        newDirection = 'w';
      }
      break;
    case 'w':
      multiplier = -1;
      if (smoothSpeed.x < 0.05) {
        newDirection = 'e';
      }
      break;
  }

  // swing between 0 and 0.5, making the center point 0.5, and the edges 0 (e.g [0 <-> 0.5 <-> 0])
  if (x > orgX) smoothSpeed.x = Math.abs(1 - smoothSpeed.x);
  if (y > orgY) smoothSpeed.y = Math.abs(1 - smoothSpeed.y);
  smoothSpeed.x = smoothSpeed.x * multiplier * 5;
  smoothSpeed.y = smoothSpeed.y * multiplier * 5;

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
