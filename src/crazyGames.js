import { emit } from 'kontra';
import { AD_FINISHED, AD_PLAYING } from './gameEvents';
import { loadScript } from './utils';

let crazyGameSdk;
const crazyAdSizes = [
  { x: 970, y: 90 },
  { x: 320, y: 50 },
  { x: 160, y: 600 },
  { x: 336, y: 280 },
  { x: 728, y: 90 },
  { x: 300, y: 600 },
  { x: 468, y: 60 },
  { x: 970, y: 250 },
  { x: 300, y: 250 },
  { x: 250, y: 250 },
  { x: 120, y: 600 },
];

export const initCrazyGamesSdk = () => {
  if (!location.href.match('crazygames') || location.href.match('netlify')) {
    return Promise.reject();
  }
  return loadCrazyGamesSdk().then(() => {
    crazyGameSdk = window.CrazyGames.CrazySDK.getInstance();
    crazyGameSdk.init();
    listenForAdEvents();
    initAdBanner();
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

const initAdBanner = () => {
  const adBannerEl = document.createElement('div');
  adBannerEl?.setAttribute('id', 'responsive-banner-container');
  const { width, height } = getLargestCrazyAd();

  adBannerEl?.setAttribute('style', `width: ${width}px; height: ${height}px`);
  document.querySelector('body').appendChild(adBannerEl);
  crazyGameSdk?.requestResponsiveBanner(['responsive-banner-container']);
};

const getLargestCrazyAd = () => {
  const gameContainerEl = document.querySelector('#hang-by-a-thread');
  const availableWidth = window.innerWidth - gameContainerEl.clientWidth;
  const availableHeight = window.innerHeight;
  let bestWidth = 0;
  let bestHeight = 0;
  let area = 0;
  crazyAdSizes.forEach(({ x, y }) => {
    if (
      x >= bestWidth &&
      x <= availableWidth &&
      y <= availableHeight &&
      y * x >= area
    ) {
      bestWidth = x;
      bestHeight = y;
      area = x * y;
    }
  });
  return { height: bestHeight, width: bestWidth };
};

export const happytime = () => {
  crazyGameSdk?.happytime();
};
