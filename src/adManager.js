import { emit, on } from 'kontra';
import { initCrazyGamesSdk } from './crazyGames';
import {
  AD_FINISHED,
  AD_PLAYING,
  GOAL_COLLISION,
  START_LEVEL,
  START_NEXT_LEVEL,
} from './gameEvents';
import { initPokiSdk } from './poki';
import { getIsMusicEnabled, getIsPlaying, playSong, stopSong } from './sound';
import { CLICK_HAMBURGER } from './uiEvents';

let pokiSdk;
let crazyGameSdk;
export const initAdManager = () => {
  initCrazyGamesSdk().then((sdk) => {
    crazyGameSdk = sdk;
    console.log('crazyGameSdk', crazyGameSdk);
  });
  initPokiSdk().then((sdk) => {
    pokiSdk = sdk;
    console.log('pokiSdk', pokiSdk);
  });
  listenForGameEvents();
  listenForOwnAdEvents();
};

const listenForOwnAdEvents = () => {
  on(AD_PLAYING, onAdPlaying);
  on(AD_FINISHED, onAdFinished);
};

const listenForGameEvents = () => {
  on(GOAL_COLLISION, onLevelComplete);
  on(CLICK_HAMBURGER, onClickHamburger);
  on(START_LEVEL, onLevelStart);
  on(START_NEXT_LEVEL, onLevelStart);
};

const onAdPlaying = () => {
  stopMusic();
};
const onAdFinished = () => {
  startMusic();
};

const onLevelComplete = () => {
  gameplayStop();
};

const onClickHamburger = () => {
  gameplayStop();
};
const onLevelStart = () => {
  gameplayStart();
};

const stopMusic = () => {
  if (getIsMusicEnabled() && getIsPlaying()) {
    stopSong();
  }
};

const startMusic = () => {
  if (getIsMusicEnabled() && !getIsPlaying()) {
    playSong();
  }
};

const gameplayStart = () => {
  crazyGameSdk?.gameplayStart();
  pokiSdk?.gameplayStart();
};

const gameplayStop = () => {
  crazyGameSdk?.gameplayStop();
  pokiSdk?.gameplayStop();
};

export const playLevelAd = () => {
  if (!crazyGameSdk && !pokiSdk) return; // return early to prevent emitting playing ad
  emit(AD_PLAYING, {});
  crazyGameSdk?.requestAd('midgame');
  pokiSdk?.commercialBreak().finally(() => {
    emit(AD_FINISHED, {});
  });
};
