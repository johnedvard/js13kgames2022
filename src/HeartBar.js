import heartBar from 'data-url:./assets/img/heart-bar.png';
import healthFill from 'data-url:./assets/img/heart-bar-fill.png';
import { createSprite } from './utils';

export class HeartBar {
  maxHealth = 3;
  currHealth = 3;
  sprite;
  heartFillSprites = [];
  x;
  y;
  level;
  width = 26;
  height = 9;
  scale = 2;

  constructor({ level }) {
    this.x = 20;
    this.y = 20;
    this.level = level;
    createSprite({
      x: this.x,
      y: this.y,
      scale: this.scale,
      imgSrc: heartBar,
      width: this.width,
      height: this.height,
      anchor: { x: 0, y: 0 },
    }).then((sprite) => {
      this.sprite = sprite;
    });

    for (let i = 0; i < this.maxHealth; i++) {
      createSprite({
        x: this.x + (11 + i * 5) * this.scale, // offside position inside hp bar
        y: this.y + 2 * this.scale,
        scale: this.scale,
        imgSrc: healthFill,
        width: 4,
        height: 4,
        anchor: { x: 0, y: 0 },
      }).then((sprite) => this.heartFillSprites.push(sprite));
    }
  }

  update(dt) {}
  render(ctx) {
    if (!this.sprite) return;
    this.sprite.render(ctx);
    this.heartFillSprites.forEach((s) => s.render(ctx));
  }
}
