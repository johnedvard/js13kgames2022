import closeIcon from 'data-url:./assets/img/close icon.svg';
import skull from 'data-url:./assets/img/skull.png';

import { emit } from 'kontra';
import { START_LEVEL } from './gameEvents';
import { fetchArcadianHeads } from './arcadianApi';
import { setSelectedArcadian } from './store';

const overlayIds = ['main', 'bonus', 'levels'];
const levels = 20;
export const initMenu = () => {
  addButtonListeners();
  addCloseIcon();
  initLevels();
  initBonusContent();
};

const initLevels = () => {
  const levelsGridEl = document.getElementById('levels-grid');
  for (let i = 1; i < levels + 1; i++) {
    const levelEl = document.createElement('div');
    levelEl.textContent = i;
    levelEl.classList.add('level-item');
    levelsGridEl.appendChild(levelEl);
  }
};

const initBonusContent = () => {
  const bonusGridEl = document.getElementById('bonus-grid');
  pouplateBonusGrid(bonusGridEl);
  listenForBonusGridEvents(bonusGridEl);
};

const pouplateBonusGrid = (bonusGridEl) => {
  const skullImg = new Image();
  skullImg.src = skull;
  fetchArcadianHeads().then((res) => {
    for (let i = 0; i < res.length; i++) {
      const img = res[i].value.img;
      const bonusEl = document.createElement('canvas');
      bonusEl.setAttribute('height', img.height * 4);
      bonusEl.setAttribute('width', img.width * 4);
      bonusEl.classList.add('bonus-item');
      bonusEl.setAttribute('arcadian', res[i].value.id);
      const ctx = bonusEl.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.scale(8, 8);
      ctx.drawImage(skullImg, img.width / 4 - 4, img.height / 4 - 12);
      ctx.scale(1 / 2, 1 / 2);
      ctx.drawImage(img, 0, 0);
      bonusGridEl.appendChild(bonusEl);
    }
  });
};

const listenForBonusGridEvents = (bonusGridEl) => {
  bonusGridEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('bonus-item')) {
      setSelectedArcadian(e.target.getAttribute('arcadian'));
      showOverlay('main');
    }
  });
};

const addButtonListeners = () => {
  const containerEl = document.getElementById('container');
  containerEl.addEventListener('click', onContainerClick);
};

const addCloseIcon = () => {
  const closeIconImgEls = document.getElementsByClassName('close-icon');
  for (let el of closeIconImgEls) {
    el.setAttribute('src', closeIcon);
  }
};

const onContainerClick = (e) => {
  const id = e.target.id;
  const classList = e.target.classList;
  switch (id) {
    case 'levelBtn':
      showOverlay('levels');
      break;
    case 'bonusBtn':
      showOverlay('bonus');
      break;
    case 'hamburger':
      showOverlay('main');
    default:
      break;
  }

  if (classList.contains('close-icon')) {
    showOverlay('main');
  }
  if (classList.contains('level-item')) {
    showOverlay();
    emit(START_LEVEL, { levelId: +e.target.textContent });
  }
};

const showOverlay = (id) => {
  overlayIds.forEach((o) => {
    const overlayEl = document.getElementById(o);
    if (!overlayEl.classList.contains('hide')) {
      overlayEl.classList.add('hide');
    }
    if (o === id) {
      overlayEl.classList.remove('hide');
    }
  });
};
