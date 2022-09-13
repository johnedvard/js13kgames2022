import skull from 'data-url:./assets/img/skull.png';
import heart from 'data-url:./assets/img/heart.png';

import { emit, on } from './kontra';
import {
  LEVEL_COMPLETE,
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
import { IPFS_BASE_PATH } from './nearConnection';
import { doesOwnNft, getNearLevel } from './utils';
import { initGameHints } from './gameHints';
import { getIsPlaying } from './sound';
import { levels } from './levels';

const overlayIds = ['main', 'bonus', 'levels', 'level-d', 'n-l', 'thanks'];

const numLevels = Object.keys(levels).length;

let hasRemovedDisableOnBonusEls = false;

export const initMenu = () => {
  addButtonListeners();
  listenForGameEvents();
  initBonusContent();
  focusLevelSelectButton();
};

const focusLevelSelectButton = () => {
  document.getElementById('lv').focus();
};

const initLevels = () => {
  const levelsGridEl = document.getElementById('levels-g');
  levelsGridEl.innerHTML = '';
  for (let i = 1; i < numLevels + 1; i++) {
    const collectedHearts = localStorage.getItem('hearts-' + i) || 0;
    const levelEl = document.createElement('button');

    levelEl.textContent = i;
    const heartContainerEl = document.createElement('div');
    heartContainerEl.classList.add('heart-wrap');
    for (let i = 0; i < 2; i++) {
      const heartEl = document.createElement('img');
      heartEl.setAttribute('src', heart);
      if (collectedHearts > i) {
        heartEl.classList.add('collected');
      }
      heartContainerEl.appendChild(heartEl);
    }
    levelEl.appendChild(heartContainerEl);
    levelEl.classList.add('level-item');
    levelsGridEl.appendChild(levelEl);
  }
};

const initNearLevels = ({
  nftTokensBySeries,
  nftTokensForOwner,
  nftCollections,
}) => {
  const nearLoadingEl = document.getElementById('lnl');
  if (nearLoadingEl) nearLoadingEl.remove();
  const levelsGridEl = document.getElementById('nlg');
  nftCollections.forEach((collection) => {
    setNearLevel(collection.token_series_id, collection.metadata.description);
    const levelEl = document.createElement('button');
    const imgEl = document.createElement('img');
    const ownsNft = doesOwnNft(collection.token_series_id, nftTokensForOwner);

    imgEl.setAttribute('src', IPFS_BASE_PATH + collection.metadata.media);
    levelEl.setAttribute('near', 'true');
    if (!ownsNft) {
      levelEl.setAttribute('disabled', !ownsNft);
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
  const bonusGridEl = document.getElementById('bonus-g');
  pouplateBonusGrid(bonusGridEl);
  listenForBonusGridEvents(bonusGridEl);
};

const pouplateBonusGrid = (bonusGridEl) => {
  const skullImg = new Image();
  skullImg.src = skull;
  fetchArcadianHeads().then((res) => {
    for (let i = 0; i < res.length; i++) {
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
    case 'lv':
      initLevels();
      showOverlay('levels');
      document.getElementsByClassName('level-item')[0].focus();
      break;
    case 'bo':
      showOverlay('bonus');
      break;
    case 'hamburger':
      showOverlay('main');
      break;
    case 'near':
      showOverlay('n-l');
      break;
    case 'nextBtn':
      showOverlay();
      emit(START_NEXT_LEVEL);
      break;
    case 'replayBtn':
      showOverlay();
      emit(RESTART_LEVEL);
      break;
    case 'mu':
      emit(TOGGLE_MUSIC, { isMusicOn: !getIsPlaying() });
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
    showOverlay();
    emit(START_LEVEL, { levelId: +btn.textContent });
  }
};

const onNearLevelClick = (btn) => {
  if (btn && btn.getAttribute('disabled') == 'true') {
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
  initGameHints(null);
  overlayIds.forEach((o) => {
    const overlayEl = document.getElementById(o);
    if (!overlayEl.classList.contains('hide')) {
      overlayEl.classList.add('hide');
    }
    if (o == id) {
      overlayEl.classList.remove('hide');
    }
  });
};

const listenForGameEvents = () => {
  on(LEVEL_COMPLETE, onLevelComplete);
  on(NEAR_TOKENS_ADDED, onNearTokensAdded);
  on(MONETIZATION_PROGRESS, onMonetizationProgress);
  on(TOGGLE_MUSIC, onToggleMusic);
};

const onToggleMusic = () => {
  const musicBtnEl = document.getElementById('mu');
  musicBtnEl.textContent = getIsPlaying() ? 'Music is ON' : 'Music is OFF';
};
const onLevelComplete = () => {
  showOverlay('level-d');
  document.getElementById('nextBtn').focus();
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
  const coilBtnEl = document.getElementById('coilBtn');
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
  const loadingWrapper = document.getElementById('loader-wrapper');
  loadingWrapper.classList.remove('hide');
};
