import cssText from 'bundle-text:./styles.css';

import { Game } from './Game';
import { initMenu } from './menu';
import { initMonetization } from './monetization';
import { initMenuControls } from './menuControls';
import { initHtml } from './html';

export const initGame = ({ deathCount, setDeathCount }) => {
  initHtml();
  addStyles();
  new Game({ deathCount, setDeathCount });
  // TODO (johnedvard) add build flag to prevent adding NEAR if we build for crazy games
  // initNear();
  initMenu();
  initMenuControls();
  initMonetization();
};

const addStyles = () => {
  // inject <style> tag
  let style = document.createElement('style');
  style.textContent = cssText;
  const headEl = document.getElementsByTagName('head')[0];
  headEl.appendChild(style);
};
