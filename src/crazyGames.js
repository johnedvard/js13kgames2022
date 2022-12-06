import { emit, on } from 'kontra';
import {
  AD_FINISHED,
  AD_PLAYING,
  GOAL_COLLISION,
  START_LEVEL,
  START_NEXT_LEVEL,
} from './gameEvents';
import { getIsPlaying, getIsMusicEnabled, playSong, stopSong } from './sound';
import { CLICK_HAMBURGER } from './uiEvents';
import { loadScript } from './utils';

let crazyGameSdk;

export const initCrazyGamesSdk = () => {
  if (!location.href.match('crazygames') && !location.href.match('localhost')) {
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
