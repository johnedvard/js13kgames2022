import { fgc2 } from './constants';
import { playSilentSound } from './sound';
import { gameWidth, gameHeight } from './store';

export const ongoingTouches = [];
const ongoingControls = [];
let isDragging;
const maxDraws = 6;
export const getBottomTouchArea = () => gameHeight - gameHeight / 5;
export const getRightTouchArea = () => gameWidth - gameWidth / 5;
export const getLeftTouchArea = () => gameWidth / 5;

const getPosFromTouches = (touches) => {
  if (!touches || !touches.length) return;
  const canvas = document.getElementById('game-canvas');
  // @see https://stackoverflow.com/a/53405390/2124254
  let rect = canvas.getBoundingClientRect(); // assume there's no padding to the canvas element
  // @see https://stackoverflow.com/a/14384091/1471485 Need to account for scroll factor
  const top = window.pageYOffset || document.documentElement.scrollTop;
  const left = window.pageXOffset || document.documentElement.scrollLeft;

  const transformScaleX = parseFloat(gameWidth / rect.width); // account for scaling
  const transformScaleY = parseFloat(gameHeight / rect.height);
  const res = [];
  for (let i = 0; i < touches.length; i++) {
    res.push({
      id: touches[i].identifier,
      x: (touches[i].pageX - rect.left - left) * transformScaleX,
      y: (touches[i].pageY - rect.top - top) * transformScaleY,
      draws: maxDraws,
    });
  }
  return res;
};
const handleMove = (evt) => {
  const touches = evt.changedTouches;
  if (!touches.length) return;
  const pos = getPosFromTouches(touches);
  ongoingTouches.splice(ongoingTouches.length, 0, ...pos);
};

const ongoingTouchIndexById = (idToFind) => {
  for (let i = 0; i < ongoingControls.length; i++) {
    const id = ongoingControls[i].identifier;

    if (id === idToFind) {
      return i;
    }
  }
  return -1; // not found
};

const handleStart = (evt) => {
  playSilentSound(); // force to play sfx on mobile in response to an event
  isDragging = true;
  const pos = getPosFromTouches(evt.changedTouches);
  ongoingControls.push(...pos);
};
const removeOngoingControl = (evt) => {
  const touches = evt.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    let idx = ongoingTouchIndexById(touches[i].identifier);
    ongoingControls.splice(idx, 1); // remove it; we're done
  }
};
const handleEnd = (evt) => {
  isDragging = false;
  removeOngoingControl(evt);
};
const handleCancel = (evt) => {
  isDragging = false;
  removeOngoingControl(evt);
};

const removeTouches = () => {
  for (let i = ongoingTouches.length - 1; i >= 0; i--) {
    if (ongoingTouches[i].draws <= 0) {
      ongoingTouches.splice(i, 1);
    }
  }
};

const updateCanvasTouchArea = (player) => {
  ongoingControls.forEach((touch) => {
    if (touch.y > getBottomTouchArea()) {
      player.applyForce(0, -5);
    }
    if (touch.x > getRightTouchArea()) {
      player.applyForce(1.5, -1);
      player.changePlayerDirection(false);
    }
    if (touch.x <= getLeftTouchArea()) {
      player.applyForce(-1.5, -1);
      player.changePlayerDirection(true);
    }
  });
};

export const updateTouchControls = (player) => {
  updateCanvasTouchArea(player);
};

export const initTouchControls = () => {
  const el = document.getElementById('game-canvas');
  el.addEventListener('touchmove', handleMove);
  el.addEventListener('touchstart', handleStart);
  el.addEventListener('touchend', handleEnd);
  el.addEventListener('touchcancel', handleCancel);
};

export const drawDragline = (ctx) => {
  if (!ongoingTouches.length) return;
  // cleanup leftover touches
  if (!isDragging) {
    ongoingTouches[0].draws--;
  }
  ctx.strokeStyle = fgc2;
  const touchesById = getTouchesById();
  for (let id in touchesById) {
    const touches = touchesById[id];
    for (let i = 0; i < touches.length - 1; i++) {
      const prev = touches[i];
      const next = touches[i + 1];
      if (prev.draws > 0 && next.draws > 0) {
        ctx.lineWidth = prev.draws * 2;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }
      prev.draws--;
    }
  }
  removeTouches();
};

export const getTouchesById = () => {
  const touchesById = {};
  for (let i = 0; i < ongoingTouches.length; i++) {
    if (touchesById[ongoingTouches[i].id]) {
      touchesById[ongoingTouches[i].id].push(ongoingTouches[i]);
    } else {
      touchesById[ongoingTouches[i].id] = [ongoingTouches[i]];
    }
  }
  return touchesById;
};
