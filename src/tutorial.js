import { Text } from 'kontra';
import { fgc2 } from './constants';
let phaseLevel1 = 0; // cumulative delta time
const level1Guidelines = 16;
let hideLevel1GuideNumber = 0;
let textLevel1;

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
      initText();
      renderLevel1(ctx);
      break;
    case 2:
      renderLevel2(ctx);
      break;
  }
};
const initText = () => {
  if (textLevel1) return;
  textLevel1 = Text({
    text: 'Slide your finger or\n drag mouse to cut rope',
    font: '20px Arial',
    color: fgc2,
    x: 620,
    y: 300,
    anchor: { x: 0.5, y: 0.5 },
    textAlign: 'center',
  });
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
    ctx.rect(startX, startY, 15, 5); // Render collision box
    ctx.stroke();
  }
  if (textLevel1) textLevel1.render();
};

const updateLevel2 = () => {};
const renderLevel2 = (ctx) => {
  if (!ctx) return;
};
