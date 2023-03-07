import skintoneIcon from 'data-url:./assets/img/Skintone.svg';
import mouthIcon from 'data-url:./assets/img/Mouth.svg';
import genderIcon from 'data-url:./assets/img/Gender.svg';
import eyeIcon from 'data-url:./assets/img/Eye.svg';
import classIcon from 'data-url:./assets/img/Class.svg';

import { createSprite } from './utils';

export class ProgressIcon {
  height = 0;
  constructor({ levelId, x, y }) {
    this.createProgressIcon({ levelId, x, y });
  }

  getIcon = (levelId) => {
    let imgSrc;
    let width;
    let height;
    switch (levelId) {
      case 1:
        imgSrc = classIcon;
        width = 17;
        height = 32;
        break;
      case 2:
        imgSrc = genderIcon;
        width = 25;
        height = 35;
        break;
      case 3:
        imgSrc = skintoneIcon;
        width = 25;
        height = 24;
        break;
      case 4:
        imgSrc = eyeIcon;
        width = 25;
        height = 25;
        break;
      case 5:
        imgSrc = mouthIcon;
        width = 25;
        height = 15;
        break;
    }
    return { imgSrc, width, height };
  };

  createProgressIcon = ({ levelId, x, y }) => {
    const { imgSrc, width, height } = this.getIcon(levelId);
    this.height = height;
    this.width = width;
    createSprite({
      x,
      y,
      imgSrc,
      width: width,
      height: height,
      scale: 1,
      anchor: { x: 0, y: 0 },
    }).then((sprite) => {
      this.sprite = sprite;
    });
  };

  render(ctx) {
    if (!this.sprite) return;
    this.sprite.render();
  }
}
