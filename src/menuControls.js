import { offGamepad, offInput, onGamepad, onInput } from 'kontra';
import { isMenuVisible } from './menu';

export const initMenuControls = () => {
  onInput(['w', 'arrowup'], onNavigateUp);
  onGamepad('dpadup', onNavigateUp);

  onInput(['s', 'arrowdown'], onNavigateDown);
  onGamepad('dpaddown', onNavigateDown);
};

export const destroy = () => {
  offInput(['w', 'arrowup'], onNavigateUp);
  offGamepad('dpadup', onNavigateUp);

  offInput(['s', 'arrowdown'], onNavigateDown);
  offGamepad('dpaddown', onNavigateDown);
};

const navigate = (direction, evt, btn) => {
  if (!isMenuVisible) return;
  const focusedEl = document.activeElement;
  const nextSiblingEl = focusedEl.nextElementSibling;
  if (nextSiblingEl) nextSiblingEl.focus();
  if (direction === 'south') {
  } else {
  }
};

const onNavigateUp = (evt, btn) => {
  navigate('up', evt, btn);
};
const onNavigateDown = (evt, btn) => {
  navigate('down', evt, btn);
};
