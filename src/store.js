import { emit } from './kontra';
import { ARCADIAN_HEAD_SELECTED, NEAR_TOKENS_ADDED } from './gameEvents';

export let gameWidth = 0;
export let gameHeight = 0;
const arcadianData = {};
let selectedArcadian = {};
export let nftTokensBySeries = [];
export let nftTokensForOwner = [];
export let nftCollections = [];
export let isSubscriber = false;
export const nearLevelData = {};

export const setGameWidth = (width) => {
  gameWidth = width;
};

export const setGameHeight = (height) => {
  gameHeight = height;
};

export const setArcadianData = ({ id, data, img }) => {
  arcadianData[id] = { data, img };
};

export const setSelectedArcadian = (id) => {
  selectedArcadian = arcadianData[id];
  emit(ARCADIAN_HEAD_SELECTED, { img: selectedArcadian.img });
};

export const getSelectedArcadian = () => {
  return selectedArcadian;
};

export const setNftTokens = (tokensForOwner, tokensBySeries, collections) => {
  nftTokensForOwner = tokensForOwner;
  nftTokensBySeries = tokensBySeries;
  nftCollections = collections;
  emit(NEAR_TOKENS_ADDED, {
    nftTokensBySeries,
    nftTokensForOwner,
    nftCollections,
  });
};

export const setIsSubscriber = () => {
  isSubscriber = true;
};

export const setNearLevel = (id, data) => {
  nearLevelData[id] = data;
};
