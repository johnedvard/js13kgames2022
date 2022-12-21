import { Text } from 'kontra';
import { fgc2 } from './constants';
import { gameHeight, gameWidth } from './store';
import {
  getBottomTouchArea,
  getLeftTouchArea,
  getRightTouchArea,
} from './touchControls';
let phaseLevel1 = 0; // cumulative delta time
let phaseLevel2 = 0; // cumulative delta time
const level1Guidelines = 16;
let hideLevel1GuideNumber = 0;
let textLevel1;
let textsLevel2 = [];
let strokeWidthLevel2 = 0;

export const updateTutorial = (dt, level) => {
  if (!level || !level.levelId) return;
  switch (level.levelId) {
    case 1:
      updateLevel1(dt);
      break;
    case 2:
      updateLevel2(dt);
      break;
  }
};
export const renderTutorial = (level, ctx) => {
  if (!level || !level.levelId) return;
  switch (level.levelId) {
    case 1:
      initTextLevel1();
      renderLevel1(ctx);
      break;
    case 2:
      initTextLevel2();
      renderLevel2(ctx);
      break;
  }
};
const initTextLevel1 = () => {
  if (textLevel1) return;
  textLevel1 = Text({
    text: 'Press "S",\nslide your finger or\n drag mouse to cut rope',
    font: '20px Arial',
    color: fgc2,
    x: 620,
    y: 420,
    anchor: { x: 0.5, y: 0.5 },
    textAlign: 'center',
  });
};
const initTextLevel2 = () => {
  if (textsLevel2.length) return;
  const part1 = Text({
    text: 'Tap here or\npress "right"\nto move',
    font: '20px Arial',
    color: fgc2,
    x: 720,
    y: 400,
    anchor: { x: 0.5, y: 0.5 },
    textAlign: 'center',
  });
  const part3 = Text({
    text: 'Tap here or\npress "left"\nto move',
    font: '20px Arial',
    color: fgc2,
    x: 80,
    y: 400,
    anchor: { x: 0.5, y: 0.5 },
    textAlign: 'center',
  });
  const part2 = Text({
    text: 'Tap here\nor press "space"\nto give the skull a boost up',
    font: '20px Arial',
    color: fgc2,
    x: 400,
    y: 750,
    anchor: { x: 0.5, y: 0.5 },
    textAlign: 'center',
  });
  textsLevel2.push(part1, part2, part3);
};
const updateLevel1 = (dt) => {
  phaseLevel1 = phaseLevel1 += dt * 10;
  hideLevel1GuideNumber = phaseLevel1.toFixed(0) % level1Guidelines;
};
const renderLevel1 = (ctx) => {
  if (!ctx) return;
  const startPos = { x: 130, y: 355 };
  for (let i = 0; i < 16; i++) {
    ctx.beginPath();
    ctx.lineWidth = 3;
    if (hideLevel1GuideNumber === i) {
      ctx.lineWidth = 1;
    }
    let startX = startPos.x + i * 35;
    let startY = startPos.y;
    ctx.moveTo(startX, startY);
    ctx.rect(startX, startY, 15, 5);
    ctx.stroke();
  }
  if (textLevel1) textLevel1.render();
};

const updateLevel2 = (dt) => {
  phaseLevel2 = phaseLevel2 += dt * 2;
  strokeWidthLevel2 = Math.abs(Math.sin(phaseLevel2.toFixed(1))) * 3;
};
const renderLevel2 = (ctx) => {
  if (!ctx) return;

  ctx.beginPath();
  ctx.lineWidth = strokeWidthLevel2;
  ctx.moveTo(0, 0);
  ctx.rect(0, 0, getLeftTouchArea(), gameHeight);
  ctx.moveTo(getRightTouchArea(), 0);
  ctx.rect(getRightTouchArea(), 0, gameWidth, gameHeight);
  ctx.moveTo(0, getBottomTouchArea());
  ctx.rect(0, getBottomTouchArea(), gameWidth, gameHeight);
  ctx.stroke();

  textsLevel2.forEach((part) => {
    part.render();
  });
};
