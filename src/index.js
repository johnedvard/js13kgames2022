import { emit } from 'kontra';

import cssText from 'bundle-text:./styles.css';

import { Game } from './Game';
import { initLoginLogout } from './near/nearLogin';
import { NearConnection } from './near/nearConnection';
import { initMenu } from './menu';

const init = () => {
  addStyles();
  new Game();
  initNear();
  initMenu();
  // fetchArcadianHeads();
};

const addStyles = () => {
  // inject <style> tag
  let style = document.createElement('style');
  style.textContent = cssText;
  const headEl = document.getElementsByTagName('head')[0];
  headEl.appendChild(style);
};

const initNear = () => {
  loadNearApi().then(() => {
    const nearConnection = new NearConnection();
    nearConnection.initContract().then(() => {
      initLoginLogout(nearConnection);
    });
  });
};

const loadNearApi = () => {
  return new Promise((resolve) => {
    if (window.nearApi) resolve();
    const script = document.createElement('script');
    script.onload = () => {
      resolve();
    };
    script.src = 'https://js13kgames.com/src/near-api-js.js';
    document.head.appendChild(script);
  });
};

init();
