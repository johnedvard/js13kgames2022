import { emit } from 'kontra';
import { START_LEVEL } from './gameEvents';

const overlayIds = ['main', 'bonus', 'levels'];
const levels = 12;
export const initMenu = () => {
  addButtonListeners();
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
const initBonusContent = () => {};

const addButtonListeners = () => {
  const containerEl = document.getElementById('container');
  containerEl.addEventListener('click', onContainerClick);
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
    emit(START_LEVEL, { levelId: e.target.textContent });
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
