import { emit } from 'kontra';

import cssText from 'bundle-text:./styles.css';

import { Game } from './Game';
import { initLoginLogout } from './near/nearLogin';
import {
  HANG_BY_A_THREAD_SERIES_TESTNET,
  NearConnection,
} from './near/nearConnection';
import { initMenu } from './menu';
import { setNftTokens } from './store';

const init = () => {
  addStyles();
  new Game();
  initNear();
  initMenu();
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
      const promises = [
        nearConnection.nft_tokens_for_owner(nearConnection.accountId),
        nearConnection.nft_tokens_by_series(HANG_BY_A_THREAD_SERIES_TESTNET),
      ];
      Promise.all(promises).then(([tokensForOwner, tokensBySeries]) => {
        setNftTokens(tokensForOwner, tokensBySeries);
        console.log('nft_tokens_for_owner', tokensForOwner);
        console.log('nft_tokens_by_series', tokensBySeries);
      });
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
