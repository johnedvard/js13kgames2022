import { fgc2 } from './constants';
import { playSilentSound } from './sound';
import { gameWidth, gameHeight } from './store';

export const ongoingTouches = [];
const ongoingControls = [];
let isDragging;
const maxDraws = 6;

const getPosFromTouches = (touches) => {
  if (!touches || !touches.length) return;
  const canvas = document.getElementById('game-canvas');
  // @see https://stackoverflow.com/a/53405390/2124254
  let rect = canvas.getBoundingClientRect(); // assume there's no padding to the canvas element
  const transformScaleX = parseFloat(gameWidth / rect.width); // account for scaling
  const transformScaleY = parseFloat(gameHeight / rect.height);
  const res = [];
  for (let i = 0; i < touches.length; i++) {
    res.push({
      id: touches[i].identifier,
      x: (touches[i].pageX - rect.left) * transformScaleX,
      y: (touches[i].pageY - rect.top) * transformScaleY,
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
  console.log('handle start', evt);
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
  console.log('handle end ', evt);
};
const handleCancel = (evt) => {
  isDragging = false;
  removeOngoingControl(evt);
  console.log('handle cancel', evt);
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
    if (touch.y > gameHeight - gameHeight / 5) {
      player.applyForce(0, -5);
    }
    if (touch.x > gameWidth - gameWidth / 5) {
      player.applyForce(1.5, -1);
      player.changePlayerDirection(false);
    }
    if (touch.x <= gameWidth / 5) {
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
  for (let i = 0; i < ongoingTouches.length - 1; i++) {
    const prev = ongoingTouches[i];
    const next = ongoingTouches[i + 1];
    if (prev.draws > 0 && next.draws > 0) {
      ctx.lineWidth = prev.draws * 2;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
    prev.draws--;
  }
  removeTouches();
};
