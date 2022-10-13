import { loadScript } from './utils';

let crazyGameSdk;

export const initCrazyGamesSdk = () => {
  loadCrazyGamesSdk().then(() => {
    crazyGameSdk = window.CrazyGames.CrazySDK.getInstance();
    crazyGameSdk.init();
  });
};

const loadCrazyGamesSdk = () => {
  return loadScript('https://sdk.crazygames.com/crazygames-sdk-v1.js');
};
