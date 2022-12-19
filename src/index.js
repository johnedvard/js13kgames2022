import cssText from 'bundle-text:./styles.scss';

import { Game } from './Game';
import { initMenu } from './menu';
import { initMonetization } from './monetization';
import { initMenuControls } from './menuControls';
import { initHtml } from './html';
import { numLevels } from './levels/levels';
import { initMenuControls } from './menuControls';
import { initAdManager } from './adManager';
import { getItem } from './storage';

export const initGame = ({ setDeathCount, updateLevelsCompleted }) => {
  initHtml();
  addStyles();
  new Game({ setDeathCount, updateLevelsCompleted });
  // TODO (johnedvard) add build flag to prevent adding NEAR if we build for crazy games
  // initNear();
  setLevelsCompleteInParent(updateLevelsCompleted);
  setDeathCountInParent(setDeathCount);

  initMenu();
  initMenuControls();
  initAdManager();
  initMonetization();
};

const setDeathCountInParent = (setDeathCount = () => {}) => {
  const deathCount = Number(getItem('deathCount'));
  if (!Number.isNaN(deathCount)) {
    setDeathCount(deathCount);
  }
};
const setLevelsCompleteInParent = (updateLevelsCompleted = () => {}) => {
  const completedLevels = {};
  for (let i = 1; i < numLevels + 1; i++) {
    const levelKey = `level${i}`;
    const levelCompleted = Boolean(getItem(levelKey));
    if (levelCompleted) completedLevels[levelKey] = levelCompleted;
  }
  updateLevelsCompleted(completedLevels);
};

const addStyles = () => {
  // inject <style> tag
  let style = document.createElement('style');
  style.textContent = cssText;
  const headEl = document.getElementsByTagName('head')[0];
  headEl.appendChild(style);
};
