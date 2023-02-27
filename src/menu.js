import btnHover from 'data-url:./assets/img/btn-hover.png';
import btnDefault from 'data-url:./assets/img/btn-default.png';

import { emit, on } from 'kontra';

import {
  LEVEL_COMPLETE,
  LEVEL_QUIT,
  MONETIZATION_PROGRESS,
  NEAR_TOKENS_ADDED,
  NFT_BUY,
  DISPLAY_GAME_OVER,
  RESTART_LEVEL,
  START_LEVEL,
  START_NEXT_LEVEL,
  TOGGLE_MUSIC,
} from './gameEvents';
import { setNearLevel } from './store';
import { IPFS_BASE_PATH } from './near/nearConnection';
import { doesOwnNft, getNearLevel } from './utils';
import { getIsPlaying } from './sound';
import { numLevels } from './levels/levels';
import { CLICK_HAMBURGER, LOGIN_NEAR, LOGOUT_NEAR } from './uiEvents';
import { getItem, getLastCompletedLevel } from './storage';

const overlayIds = [
  'main',
  'bonus',
  'levels',
  'level-dialog',
  'near-levels',
  'thanks',
];

let hasRemovedDisableOnBonusEls = false;
export let isMenuVisible = true;

export const initMenu = () => {
  addButtonListeners();
  listenForGameEvents();
  listenForUiEvents();
  focusPlayNowBtn();
  changeNameOfPlayButton();
  setButtonImg();
  setSvgBtnListener();
};

const setSvgBtnListener = () => {
  document.querySelectorAll('.svg-btn').forEach((el) => {
    el.addEventListener('mouseover', function () {
      this.classList.add('show-hover');
    });
    el.addEventListener('mouseleave', function () {
      this.classList.remove('show-hover');
    });
  });
};

const setButtonImg = () => {
  document.querySelectorAll('.svg-placeholder').forEach((el) => {
    el.innerHTML = `<img id='btn-hover' src="${btnHover}"><img id='btn-default' src="${btnDefault}">`;
  });
};
const changeNameOfPlayButton = () => {
  if (getLastCompletedLevel() > 0) {
    document.getElementById('play-now-txt').textContent = 'Continue';
  }
};
const focusPlayNowBtn = () => {
  document.getElementById('play-now-btn').focus();
};

const initLevels = () => {
  const levelsGridEl = document.getElementById('levels-grid');
  levelsGridEl.innerHTML = '';

  for (let i = 1; i < numLevels + 1; i++) {
    const levelEl = document.createElement('button');

    levelEl.textContent = i;
    if (!Boolean(getItem(`level${i - 1}`)) && i > 1) {
      levelEl.setAttribute('disabled', true);
      levelEl.classList.add('disabled');
    }

    levelEl.classList.add('level-item');
    levelsGridEl.appendChild(levelEl);
  }
};

const initNearLevels = ({
  nftTokensBySeries,
  nftTokensForOwner,
  nftCollections,
}) => {
  const nearLoadingEl = document.getElementById('loading-near-levels');
  if (nearLoadingEl) nearLoadingEl.remove();
  const levelsGridEl = document.getElementById('near-levels-grid');
  nftCollections.forEach((collection) => {
    setNearLevel(collection.token_series_id, collection.metadata.description);
    const levelEl = document.createElement('button');
    const imgEl = document.createElement('img');
    const ownsNft = doesOwnNft(collection.token_series_id, nftTokensForOwner);

    imgEl.setAttribute('src', IPFS_BASE_PATH + collection.metadata.media);
    levelEl.setAttribute('near', 'true');
    if (!ownsNft) {
      levelEl.classList.add('disabled');
    }
    levelEl.setAttribute('token-series-id', collection.token_series_id);
    // TODO (johnedvard) figure out how to use actual prize and pay for storage instead of hardcoding 1N (actual price is 0.5N)
    levelEl.setAttribute('price', '1000000000000000000000000');
    levelEl.textContent = collection.metadata.title;
    levelEl.appendChild(imgEl);
    const mintForPriceEl = document.createElement('span');
    if (!ownsNft) {
      mintForPriceEl.textContent =
        'Buy level for: ' +
        (collection.price / Math.pow(10, 24)).toFixed(2) +
        ' Ⓝ';
    } else {
      mintForPriceEl.textContent = 'Click to play level';
    }
    levelEl.appendChild(mintForPriceEl);
    levelEl.classList.add('level-item');
    levelsGridEl.appendChild(levelEl);
  });
};

const addButtonListeners = () => {
  const containerEl = document.getElementById('wrap');
  containerEl.addEventListener('click', onContainerClick);
};

const onContainerClick = (e) => {
  let id = e.target.id;
  const classList = e.target.classList;

  let closest = e.target.closest('#play-now-btn');
  if (closest) id = 'play-now-btn';
  closest = e.target.closest('#music-btn');
  if (closest) id = 'music-btn';
  closest = e.target.closest('#next-btn');
  if (closest) id = 'next-btn';

  switch (id) {
    case 'play-now-btn':
      showOverlay();
      emit(START_LEVEL, { levelId: getLastCompletedLevel() + 1 });
      break;
    case 'select-level-btn':
      initLevels();
      showOverlay('levels');
      document.getElementsByClassName('level-item')[0].focus();
      break;
    case 'bonus-content-btn':
      showOverlay('bonus');
      break;
    case 'hamburger':
      changeNameOfPlayButton();
      emit(CLICK_HAMBURGER);
      showOverlay('main');
      break;
    case 'near-level-btn':
      showOverlay('near-levels');
      break;
    case 'next-btn':
      showOverlay();
      emit(START_NEXT_LEVEL);
      break;
    case 'replay-btn':
      showOverlay();
      emit(RESTART_LEVEL);
      break;
    case 'music-btn':
      emit(TOGGLE_MUSIC);
      break;
  }

  if (classList.contains('inverse')) {
    showOverlay('main');
    return;
  }

  const btn = e.target.closest('button');
  if (btn && btn.getAttribute('near')) {
    onNearLevelClick(btn);
  } else if (btn && btn.classList.contains('level-item')) {
    showOverlay();
    emit(START_LEVEL, { levelId: +btn.textContent });
  }
};

const onNearLevelClick = (btn) => {
  if (btn && btn.classList.contains('disabled')) {
    showLoading();
    const token_series_id = btn.getAttribute('token-series-id');
    const priceInYoctoNear = btn.getAttribute('price');
    emit(NFT_BUY, { token_series_id, priceInYoctoNear });
  } else {
    showOverlay();
    emit(START_LEVEL, {
      levelData: JSON.parse(getNearLevel(btn.getAttribute('token-series-id'))),
    });
  }
};

export const showOverlay = (id) => {
  if (!id) {
    isMenuVisible = false;
  } else {
    isMenuVisible = true;
  }
  emit(LEVEL_QUIT, {});
  overlayIds.forEach((o) => {
    const overlayEl = document.getElementById(o);
    if (!overlayEl.classList.contains('hide')) {
      overlayEl.classList.add('hide');
    }
    if (o === id) {
      overlayEl.classList.remove('hide');
    }
  });
};

const listenForUiEvents = () => {
  on(LOGIN_NEAR, onNearLogin);
  on(LOGOUT_NEAR, onNearLogout);
};

const onNearLogin = () => {
  showLoading();
};

const onNearLogout = () => {
  const nearLevelBtnEl = document.getElementById('near-level-btn');
  nearLevelBtnEl.classList.add('disabled');
  nearLevelBtnEl.setAttribute('disabled', 'true');
};

const listenForGameEvents = () => {
  on(LEVEL_COMPLETE, onLevelComplete);
  on(NEAR_TOKENS_ADDED, onNearTokensAdded);
  on(DISPLAY_GAME_OVER, onDisplayGameOver);
  on(MONETIZATION_PROGRESS, onMonetizationProgress);
  on(TOGGLE_MUSIC, onToggleMusic);
};

const onToggleMusic = () => {
  const musicBtnEl = document.getElementById('music-on-off');
  musicBtnEl.textContent = getIsPlaying() ? 'Music is ON' : 'Music is OFF';
};
const onLevelComplete = () => {
  document.getElementById('level-over-msg').innerHTML = 'SUCCESS!';
  showOverlay('level-dialog');
  document.getElementById('next-btn').focus();
};
const onDisplayGameOver = () => {
  document.getElementById('level-over-msg').innerHTML = 'YOU DIED';
  showOverlay('level-dialog');
  document.getElementById('next-btn').focus();
};
const onNearTokensAdded = ({
  nftTokensBySeries,
  nftTokensForOwner,
  nftCollections,
}) => {
  initNearLevels({ nftTokensBySeries, nftTokensForOwner, nftCollections });
};

const onMonetizationProgress = () => {
  if (hasRemovedDisableOnBonusEls) return;
  const coilSubEl = document.getElementById('coil-subscriber');
  const coilBtnEl = document.getElementById('coil-btn');
  if (coilBtnEl) coilBtnEl.remove();
  if (coilSubEl) coilSubEl.classList.remove('hide');
  const bonusItemEls = document.getElementsByClassName('bonus-item');
  for (let item of bonusItemEls) {
    item.classList.remove('disabled');
  }
  if (bonusItemEls && bonusItemEls.length) {
    hasRemovedDisableOnBonusEls = true;
  }
};

const showLoading = () => {
  const loadingWrapper = document.getElementById('loading-wrapper');
  loadingWrapper.classList.remove('hide');
};
