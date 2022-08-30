import closeIcon from 'data-url:./assets/img/close icon.svg';
import skull from 'data-url:./assets/img/skull.png';

import { emit, on } from 'kontra';
import {
  LEVEL_COMPLETE,
  NEAR_TOKENS_ADDED,
  NFT_MINT,
  RESTART_LEVEL,
  START_LEVEL,
  START_NEXT_LEVEL,
} from './gameEvents';
import { fetchArcadianHeads } from './arcadianApi';
import { nftTokensBySeries, setSelectedArcadian } from './store';
import { IPFS_BASE_PATH } from './near/nearConnection';
import { doesOwnNft, getNearLevelId } from './utils';

const overlayIds = ['main', 'bonus', 'levels', 'level-dialog', 'near-levels'];
const levels = 20;
export const initMenu = () => {
  addButtonListeners();
  listenForGameEvents();
  addCloseIcon();
  initLevels();
  initBonusContent();
  focusLevelSelectButton();
};

const focusLevelSelectButton = () => {
  document.getElementById('levelBtn').focus();
};

const initLevels = () => {
  const levelsGridEl = document.getElementById('levels-grid');
  for (let i = 1; i < levels + 1; i++) {
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
  const nearLoadingEl = document.getElementById('loadingNearLevels');
  if (nearLoadingEl) nearLoadingEl.remove();
  const levelsGridEl = document.getElementById('near-levels-grid');
  nftCollections.forEach((collection) => {
    const levelEl = document.createElement('button');
    const imgEl = document.createElement('img');
    const ownsNft = doesOwnNft(collection.token_series_id, nftTokensForOwner);

    imgEl.setAttribute('src', IPFS_BASE_PATH + collection.metadata.media);
    levelEl.setAttribute('near', 'true');
    if (!ownsNft) {
      levelEl.setAttribute('disabled', !ownsNft);
    }
    levelEl.setAttribute('token-series-id', collection.token_series_id);
    levelEl.setAttribute('price', collection.price);
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
      const img = res[i].value.img;
      const bonusEl = document.createElement('canvas');
      bonusEl.setAttribute('height', img.height * 4);
      bonusEl.setAttribute('width', img.width * 4);
      bonusEl.classList.add('bonus-item');
      bonusEl.setAttribute('arcadian', res[i].value.id);
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
      setSelectedArcadian(e.target.getAttribute('arcadian'));
      showOverlay('main');
    }
  });
};

const addButtonListeners = () => {
  const containerEl = document.getElementById('container');
  containerEl.addEventListener('click', onContainerClick);
};

const addCloseIcon = () => {
  const closeIconImgEls = document.getElementsByClassName('close-icon');
  for (let el of closeIconImgEls) {
    el.setAttribute('src', closeIcon);
  }
};

const onContainerClick = (e) => {
  const id = e.target.id;
  const classList = e.target.classList;
  switch (id) {
    case 'levelBtn':
      showOverlay('levels');
      document.getElementsByClassName('level-item')[0].focus();
      break;
    case 'bonusBtn':
      showOverlay('bonus');
      break;
    case 'hamburger':
      showOverlay('main');
      break;
    case 'nearLevelBtn':
      showOverlay('near-levels');
      break;
    case 'nextBtn':
      showOverlay();
      emit(START_NEXT_LEVEL);
      break;
    case 'replayBtn':
      showOverlay();
      emit(RESTART_LEVEL);
      break;
  }

  if (classList.contains('close-icon')) {
    showOverlay('main');
    return;
  }

  const btn = e.target.closest('button');
  if (btn && btn.getAttribute('near')) {
    onNearLevelClick(btn);
  } else if (classList.contains('level-item')) {
    showOverlay();
    emit(START_LEVEL, { levelId: +e.target.textContent });
  }
};

const onNearLevelClick = (btn) => {
  if (btn && btn.getAttribute('disabled') === 'true') {
    const token_series_id = btn.getAttribute('token-series-id');
    const priceInYoctoNear = btn.getAttribute('price');
    emit(NFT_MINT, { token_series_id, priceInYoctoNear });
  } else {
    showOverlay();
    emit(START_LEVEL, {
      levelId: getNearLevelId(btn.getAttribute('token-series-id')),
    });
  }
};

const showOverlay = (id) => {
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

const listenForGameEvents = () => {
  on(LEVEL_COMPLETE, onLevelComplete);
  on(NEAR_TOKENS_ADDED, onNearTokensAdded);
};
const onLevelComplete = () => {
  showOverlay('level-dialog');
  document.getElementById('nextBtn').focus();
};
const onNearTokensAdded = ({
  nftTokensBySeries,
  nftTokensForOwner,
  nftCollections,
}) => {
  initNearLevels({ nftTokensBySeries, nftTokensForOwner, nftCollections });
};
