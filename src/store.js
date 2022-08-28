import { emit } from 'kontra';
import { ARCADIAN_HEAD_SELECTED } from './gameEvents';

export let gameWidth = 0;
export let gameHeight = 0;
const arcadianData = {};
let selectedArcadian = {};

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
