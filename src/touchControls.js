import { getPointer } from 'kontra';
import { fgc2 } from './constants';
import { gameWidth, gameHeight } from './store';

export const ongoingTouches = [];
let isDragging;
const maxDraws = 6;
let isLeftBtnDown = false;
let isRightBtnDown = false;
let isBoostBtnDown = false;

const handleMove = (evt) => {
  const pointer = getPointer();
  if (!pointer.touches.length) return;
  const touch = pointer.touches[0];
  ongoingTouches.push({ x: touch.x, y: touch.y, draws: maxDraws });
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
  const boostBtnEl = document.getElementById('touch-boost');

  leftBtnEl.addEventListener('mousedown', () => (isLeftBtnDown = true));
  boostBtnEl.addEventListener('mousedown', () => (isBoostBtnDown = true));
  rightBtnEl.addEventListener('mousedown', () => (isRightBtnDown = true));
  leftBtnEl.addEventListener('touchstart', () => (isLeftBtnDown = true));
  boostBtnEl.addEventListener('touchstart', () => (isBoostBtnDown = true));
  rightBtnEl.addEventListener('touchstart', () => (isRightBtnDown = true));
  leftBtnEl.addEventListener('touchend', () => (isLeftBtnDown = false));
  boostBtnEl.addEventListener('touchend', () => (isBoostBtnDown = false));
  rightBtnEl.addEventListener('touchend', () => (isRightBtnDown = false));
  leftBtnEl.addEventListener('mouseout', () => (isLeftBtnDown = false));
  boostBtnEl.addEventListener('mouseout', () => (isBoostBtnDown = false));
  rightBtnEl.addEventListener('mouseout', () => (isRightBtnDown = false));
  leftBtnEl.addEventListener('mouseup', () => (isLeftBtnDown = false));
  boostBtnEl.addEventListener('mouseup', () => (isBoostBtnDown = false));
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
  if (isBoostBtnDown) {
    player.applyForce(0, -5);
  }
  const pointer = getPointer();
  if (pointer.touches.length) {
    const touch = pointer.touches[0] || {};
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
