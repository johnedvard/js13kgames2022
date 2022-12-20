import { emit } from 'kontra';
import { AD_FINISHED, AD_PLAYING } from './gameEvents';
import { loadScript } from './utils';

let crazyGameSdk;

export const initCrazyGamesSdk = () => {
  if (!location.href.match('crazygames') || location.href.match('netlify')) {
    return Promise.reject();
  }
  return loadCrazyGamesSdk().then(() => {
    crazyGameSdk = window.CrazyGames.CrazySDK.getInstance();
    crazyGameSdk.init();
    listenForAdEvents();
    return crazyGameSdk;
  });
};

const loadCrazyGamesSdk = () => {
  return loadScript('https://sdk.crazygames.com/crazygames-sdk-v1.js');
};

const adStarted = () => {
  emit(AD_PLAYING, {});
};
const adFinished = () => {
  emit(AD_FINISHED, {});
};
const adError = () => {
  emit(AD_FINISHED, {});
};

const listenForAdEvents = () => {
  crazyGameSdk?.addEventListener('adStarted', adStarted);
  crazyGameSdk?.addEventListener('adFinished', adFinished);
  crazyGameSdk?.addEventListener('adError', adError);
};

export const happytime = () => {
  crazyGameSdk?.happytime();
};
