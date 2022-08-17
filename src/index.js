import { Game } from './Game';
import { NearConnection } from './near/nearConnection';
import { initLoginLogout } from './near/nearLogin';
const init = () => {
  new Game();
  initNear();
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
