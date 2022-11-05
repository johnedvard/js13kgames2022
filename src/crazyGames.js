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
  loadCrazyGamesSdk().then(() => {
    // crazyGameSdk = window.CrazyGames.CrazySDK.getInstance();
    // crazyGameSdk.init();
    // listenForAdEvents();
    // listenForGameEvents();
  });
};

const listenForGameEvents = () => {
  on(GOAL_COLLISION, onLevelComplete);
  on(CLICK_HAMBURGER, onClickHamburger);
  on(START_LEVEL, onLevelStart);
  on(START_NEXT_LEVEL, onLevelStart);
};

const onLevelComplete = () => {
  crazyGameplayStop();
};

const onClickHamburger = () => {
  crazyGameplayStop();
};
const onLevelStart = () => {
  crazyGameplayStart();
};
const crazyGameplayStart = () => {
  if (!crazyGameSdk) return;
  crazyGameSdk.gameplayStart();
};

const crazyGameplayStop = () => {
  if (!crazyGameSdk) return;
  crazyGameSdk.gameplayStop();
};

const loadCrazyGamesSdk = () => {
  return loadScript('https://sdk.crazygames.com/crazygames-sdk-v1.js');
};
const startMusic = () => {
  if (getIsMusicEnabled() && !getIsPlaying()) {
    playSong();
  }
};
const stopMusic = () => {
  if (getIsMusicEnabled() && getIsPlaying()) {
    stopSong();
  }
};
const adStarted = () => {
  stopMusic();
};
const adFinished = () => {
  startMusic();
  emit(AD_FINISHED, {});
};
const adError = () => {
  startMusic();
  emit(AD_FINISHED, {});
};

const listenForAdEvents = () => {
  if (!crazyGameSdk) return;
  crazyGameSdk.addEventListener('adStarted', adStarted);
  crazyGameSdk.addEventListener('adFinished', adFinished);
  crazyGameSdk.addEventListener('adError', adError);
};

export const happytime = () => {
  if (!crazyGameSdk) return;
  crazyGameSdk.happytime();
};

export const playLevelAd = () => {
  if (!crazyGameSdk) return;
  emit(AD_PLAYING, {});
  crazyGameSdk.requestAd('midgame');
};
