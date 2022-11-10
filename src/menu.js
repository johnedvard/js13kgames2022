import skull from 'data-url:./assets/img/skull.png';

import { emit, on } from 'kontra';

import {
  LEVEL_COMPLETE,
  LEVEL_QUIT,
  MONETIZATION_PROGRESS,
  NEAR_TOKENS_ADDED,
  NFT_BUY,
  RESTART_LEVEL,
  START_LEVEL,
  START_NEXT_LEVEL,
  TOGGLE_MUSIC,
} from './gameEvents';
import { fetchArcadianHeads } from './arcadianApi';
import { isSubscriber, setNearLevel, setSelectedArcadian } from './store';
import { IPFS_BASE_PATH } from './near/nearConnection';
import { doesOwnNft, getNearLevel } from './utils';
import { initGameHints } from './gameHints';
import { getIsPlaying } from './sound';
import { levels } from './levels/levels';
import { CLICK_HAMBURGER, LOGIN_NEAR, LOGOUT_NEAR } from './uiEvents';
import { crazyGameplayStop, playLevelAd } from './crazyGames';

const overlayIds = [
  'main',
  'bonus',
  'levels',
  'level-dialog',
  'near-levels',
  'thanks',
];

const numLevels = Object.keys(levels).length;

let hasRemovedDisableOnBonusEls = false;
export let isMenuVisible = true;

export const initMenu = () => {
  addButtonListeners();
  listenForGameEvents();
  listenForUiEvents();
  initBonusContent();
  focusLevelSelectButton();
};

const focusLevelSelectButton = () => {
  document.getElementById('select-level-btn').focus();
};

const initLevels = () => {
  const levelsGridEl = document.getElementById('levels-grid');
  levelsGridEl.innerHTML = '';
  for (let i = 1; i < numLevels + 1; i++) {
    const levelEl = document.createElement('button');

    levelEl.textContent = i;

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

const initBonusContent = () => {
  const bonusGridEl = document.getElementById('bonus-grid');
  pouplateBonusGrid(bonusGridEl);
  listenForBonusGridEvents(bonusGridEl);
};

const pouplateBonusGrid = (bonusGridEl) => {
  const skullImg = new Image();
  skullImg.src = skull;
  fetchArcadianHeads().then((res) => {
    for (let i = 0; i < res.length; i++) {
      // TODO (johnedvard) add slot for hat that failed to load instead of skipping
      if (res[i].status !== 'fulfilled') continue;
      const img = res[i].value.img;
      const bonusEl = document.createElement('canvas');
      bonusEl.setAttribute('height', img.height * 4);
      bonusEl.setAttribute('width', img.width * 4);
      bonusEl.classList.add('bonus-item');
      bonusEl.setAttribute('arcadian', res[i].value.id);
      if (i > 5 && !isSubscriber) {
        bonusEl.classList.add('disabled');
      }
      const ctx = bonusEl.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.scale(8, 8);
      ctx.drawImage(skullImg, img.width / 4 - 4, img.height / 4 - 12);
      ctx.scale(1 / 2, 1 / 2);
      ctx.drawImage(img, 0, 0);
      bonusGridEl.appendChild(bonusEl);
    }
  });
};

const listenForBonusGridEvents = (bonusGridEl) => {
  bonusGridEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('bonus-item')) {
      if (!e.target.classList.contains('disabled')) {
        setSelectedArcadian(e.target.getAttribute('arcadian'));
        showOverlay('main');
      } else {
        // TODO (johnedvard) tell player to become a subscriber
      }
    }
  });
};

const addButtonListeners = () => {
  const containerEl = document.getElementById('wrap');
  containerEl.addEventListener('click', onContainerClick);
};

const onContainerClick = (e) => {
  const id = e.target.id;
  const classList = e.target.classList;
  switch (id) {
    case 'select-level-btn':
      initLevels();
      showOverlay('levels');
      document.getElementsByClassName('level-item')[0].focus();
      break;
    case 'bonus-content-btn':
      showOverlay('bonus');
      break;
    case 'hamburger':
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

  if (classList.contains('bone') || classList.contains('inverse')) {
    showOverlay('main');
    return;
  }

  const btn = e.target.closest('button');
  if (btn && btn.getAttribute('near')) {
    onNearLevelClick(btn);
  } else if (btn && btn.classList.contains('level-item')) {
    playLevelAd();
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
  initGameHints(null);
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
  on(MONETIZATION_PROGRESS, onMonetizationProgress);
  on(TOGGLE_MUSIC, onToggleMusic);
};

const onToggleMusic = () => {
  const musicBtnEl = document.getElementById('music-btn');
  musicBtnEl.textContent = getIsPlaying() ? 'Music is ON' : 'Music is OFF';
};
const onLevelComplete = () => {
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
