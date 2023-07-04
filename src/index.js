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

let game;
export const initGame = ({ setDeathCount, updateLevelsCompleted }) => {
  initHtml();
  addStyles();
  game = new Game({ setDeathCount, updateLevelsCompleted });
  // TODO (johnedvard) add build flag to prevent adding NEAR if we build for crazy games
  // initNear();
  setLevelsCompleteInParent(updateLevelsCompleted);

  initMenu();
  initMenuControls();
};

export const destroyGame = () => {
  if (game) game.destroyGame();
};

const setLevelsCompleteInParent = (updateLevelsCompleted = () => {}) => {
  const completedLevels = {};
  for (let i = 1; i < numLevels + 1; i++) {
    const levelKey = `level${i}`;
    const levelState = getItem(levelKey);
    const levelCompleted = Boolean(levelState);
    if (levelCompleted) completedLevels[levelKey] = levelState;
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
