import { emit } from 'kontra';

import { Game } from './Game';
import { ARCADIAN_ADDED } from './gameEvents';
import { queryArcadian } from './arcadianApi';
import { initLoginLogout } from './near/nearLogin';
import { NearConnection } from './near/nearConnection';

const init = () => {
  new Game();
  initNear();
  fetchArcadianHeads();
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

const fetchArcadianHeads = () => {
  // TODO (johnedvard) get from localStorage so we don't call the api too much
  // get many headpices
  for (let i = 0; i < 60; i += 5)
    queryArcadian(i).then((img) => {
      if (img) {
        emit(ARCADIAN_ADDED, { img });
      }
    });
};
init();
