import cssText from 'bundle-text:./styles.css';

import { Game } from './Game';
import { initLoginLogout } from './near/nearLogin';
import {
  HANG_BY_A_THREAD_SERIES_TESTNET,
  NearConnection,
} from './near/nearConnection';
import { initMenu } from './menu';
import { setNftTokens } from './store';
import { initMonetization } from './monetization';
import { loadScript } from './utils';
import { initCrazyGamesSdk } from './crazyGames';

const init = () => {
  addStyles();
  new Game();
  // TODO (johnedvard) add build flag to prevent adding NEAR if we build for crazy games
  // initNear();
  initMenu();
  initCrazyGamesSdk();
  initMonetization();
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
      if (!nearConnection.isSignedIn()) return;
      const promises = [
        nearConnection.nft_tokens_for_owner(nearConnection.accountId),
        nearConnection.nft_tokens_by_series(HANG_BY_A_THREAD_SERIES_TESTNET),
        nearConnection.getNftCollections(),
      ];

      Promise.all(promises).then(
        ([tokensForOwner, tokensBySeries, collections]) => {
          setNftTokens(tokensForOwner, tokensBySeries, collections);
        }
      );
    });
  });
};

const loadNearApi = () => {
  return loadScript('https://js13kgames.com/src/near-api-js.js');
};

init();
