import skintoneIcon from 'data-url:./assets/img/Skintone.svg';
import mouthIcon from 'data-url:./assets/img/Mouth.svg';
import genderIcon from 'data-url:./assets/img/Gender.svg';
import eyeIcon from 'data-url:./assets/img/Eye.svg';
import classIcon from 'data-url:./assets/img/Class.svg';
import hairIcon from 'data-url:./assets/img/Hair.svg';

import { createSprite } from './utils';

export class ProgressIcon {
  height = 0;
  constructor({ levelId, x, y }) {
    this.createProgressIcon({ levelId, x, y });
  }

  getIcon = (levelId) => {
    let imgSrc;
    const width = 30;
    const height = 30;
    switch (levelId) {
      case 1:
        imgSrc = classIcon;
        break;
      case 2:
        imgSrc = genderIcon;
        break;
      case 3:
        imgSrc = skintoneIcon;
        break;
      case 4:
        imgSrc = eyeIcon;
        break;
      case 5:
        imgSrc = mouthIcon;
        break;
      case 6:
        imgSrc = hairIcon;
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
      scale: 0.2,
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
