import progressBar from 'data-url:./assets/img/progress-bar.png';
import progressFill from 'data-url:./assets/img/progress-bar-fill.png';
import progressFillDead from 'data-url:./assets/img/progress-bar-fill-dead.png';
import { createSprite } from './utils';
import { getItem } from './storage';

export class ProgressBar {
  sprite;
  progressFillSprites = [];
  x;
  y;
  level;
  width = 25;
  height = 5;
  scale = 2;

  constructor({ level }) {
    this.x = 22; // 1 pixel times scale indent from heart bar
    this.y = 46; // 8 pixels times scale below heart bar
    this.level = level;

    createSprite({
      x: this.x,
      y: this.y,
      scale: this.scale,
      imgSrc: progressBar,
      width: this.width,
      height: this.height,
      anchor: { x: 0, y: 0 },
    }).then((sprite) => {
      this.sprite = sprite;
    });

    for (let i = 0; i < this.level.levelId - 1; i++) {
      const didWinLevel = getItem(`level${i + 1}`) === 'true';
      createSprite({
        x: this.x + (1 + i * 4) * this.scale, // offside position inside hp bar
        y: this.y + 1 * this.scale,
        scale: this.scale,
        imgSrc: didWinLevel ? progressFill : progressFillDead,
        width: 3,
        height: 3,
        anchor: { x: 0, y: 0 },
      }).then((sprite) => this.progressFillSprites.push(sprite));
    }
  }

  update(dt) {}
  render(ctx) {
    if (!this.sprite) return;
    this.sprite.render(ctx);
    this.progressFillSprites.forEach((s) => s.render(ctx));
  }
  destroy() {}
}
