import { fgc2 } from './constants';
import { gameWidth, gameHeight } from './store';

export const ongoingTouches = [];
let isDragging;
const maxDraws = 6;
let isLeftBtnDown = false;
let isRightBtnDown = false;

const handleMove = (evt) => {
  const touches = evt.changedTouches;
  if (!touches.length) return;
  const canvas = document.getElementById('game-canvas');

  // @see https://stackoverflow.com/a/53405390/2124254
  let rect = canvas.getBoundingClientRect(); // assume there's no padding to the canvas element
  let transformScaleX = parseFloat(gameWidth / rect.width); // account for scaling
  let transformScaleY = parseFloat(gameHeight / rect.height);
  const pos = {
    x: (touches[0].pageX - rect.left) * transformScaleX,
    y: (touches[0].pageY - rect.top) * transformScaleY,
  };
  ongoingTouches.push({ x: pos.x, y: pos.y, draws: maxDraws });
};

const handleStart = (evt) => {
  isDragging = true;
  console.log('handle start', evt);
};
const handleEnd = (evt) => {
  isDragging = false;
  console.log('handle end ', evt);
};
const handleCancel = (evt) => {
  isDragging = false;
  console.log('handle cancel', evt);
};

const removeTouches = () => {
  for (let i = ongoingTouches.length - 1; i >= 0; i--) {
    if (ongoingTouches[i].draws <= 0) {
      ongoingTouches.splice(i, 1);
    }
  }
};

export const handleTouchControls = () => {
  const leftBtnEl = document.getElementById('touch-left');
  const rightBtnEl = document.getElementById('touch-right');

  leftBtnEl.addEventListener('mousedown', () => (isLeftBtnDown = true));
  rightBtnEl.addEventListener('mousedown', () => (isRightBtnDown = true));
  leftBtnEl.addEventListener('touchstart', () => (isLeftBtnDown = true));
  rightBtnEl.addEventListener('touchstart', () => (isRightBtnDown = true));
  leftBtnEl.addEventListener('touchend', () => (isLeftBtnDown = false));
  rightBtnEl.addEventListener('touchend', () => (isRightBtnDown = false));
  leftBtnEl.addEventListener('mouseout', () => (isLeftBtnDown = false));
  rightBtnEl.addEventListener('mouseout', () => (isRightBtnDown = false));
  leftBtnEl.addEventListener('mouseup', () => (isLeftBtnDown = false));
  rightBtnEl.addEventListener('mouseup', () => (isRightBtnDown = false));
};

export const updateTouchControls = (player) => {
  if (isLeftBtnDown) {
    player.applyForce(-1.5, -1);
    player.changePlayerDirection(true);
  }
  if (isRightBtnDown) {
    player.applyForce(1.5, -1);
    player.changePlayerDirection(false);
  }
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
