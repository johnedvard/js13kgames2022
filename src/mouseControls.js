import { getPointer, pointerPressed } from 'kontra';
import { fgc2 } from './constants';
import { gameHeight, gameWidth } from './store';

let isDragging = false;
export const mousePoints = [];
const maxDraws = 6;

const handleStart = () => {
  isDragging = true;
};

const handleEnd = () => {
  isDragging = false;
};

export const updateMouseControls = (dt) => {
  if (!isDragging) return;
  const pos = getPointer();

  mousePoints.splice(mousePoints.length, 0, {
    x: pos.x,
    y: pos.y,
    draws: maxDraws,
  }); // add to start of queue
};

export const initMouseControls = () => {
  const el = document.getElementById('game-canvas');
  el.addEventListener('mousedown', handleStart);
  el.addEventListener('mouseup', handleEnd);
};

const removeMouseDraggings = () => {
  for (let i = mousePoints.length - 1; i >= 0; i--) {
    if (mousePoints[i].draws <= 0) {
      mousePoints.splice(i, 1);
    }
  }
};

export const drawMouseLine = (ctx) => {
  if (!mousePoints.length) return;
  // cleanup leftover mouse points
  if (!isDragging) {
    mousePoints[0].draws--;
  }

  ctx.strokeStyle = fgc2;
  for (let i = 0; i < mousePoints.length - 1; i++) {
    const prev = mousePoints[i];
    const next = mousePoints[i + 1];
    if (prev.draws > 0 && next.draws > 0) {
      ctx.lineWidth = prev.draws * 2;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
    prev.draws--;
  }
  removeMouseDraggings();
};

export const updateCanvasMouseArea = (player) => {
  if (pointerPressed('left')) {
    const pointer = getPointer();
    if (pointer.y > gameHeight - gameHeight / 5) {
      player.applyForce(0, -5);
    }
    if (pointer.x > gameWidth - gameWidth / 5) {
      player.applyForce(1.5, -1);
      player.changePlayerDirection(false);
    }
    if (pointer.x <= gameWidth / 5) {
      player.applyForce(-1.5, -1);
      player.changePlayerDirection(true);
    }
  }
};
