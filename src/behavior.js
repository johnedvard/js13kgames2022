export const BACK_FORTH = 'ew';
export const UP_DOWN = 'ns';

export const moveBehavior = ({
  behavior,
  direction,
  distance,
  orgX,
  orgY,
  x,
  y,
}) => {
  let axis = '';
  let multiplier = 1;
  let newDirection = direction;
  switch (behavior) {
    case UP_DOWN:
      axis = 'y';
      break;
    case BACK_FORTH:
      axis = 'x';
      break;
  }

  switch (direction) {
    case 'n':
      multiplier = -1;
      break;
    case 's':
      multiplier = 1;
      break;
    case 'e':
      multiplier = 1;
      if (orgX + distance < x) {
        newDirection = 'w';
      }
      break;
    case 'w':
      multiplier = -1;
      if (orgX - distance > x) {
        newDirection = 'e';
      }
      break;
  }
  return { axis, multiplier, newDirection };
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
