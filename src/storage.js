import { numLevels } from './levels/levels';

// localStorage does not work in ingognito mode, so we need to wrap it in try catch, ref https://sdk.poki.com/requirements.html#incognito-support
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.error(err);
  }
};

export const getItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.error(err);
  }
};

export const getLevelStates = () => {
  const levelStates = [];
  for (let i = 1; i < numLevels + 1; i++) {
    levelStates.push(isLevelCompleted(i));
  }
  return levelStates;
};

export const getLastCompletedLevel = () => {
  return getLevelStates().reduce((prev, curr) => prev + curr, 0);
};

export const resetAllLevels = () => {
  for (let i = 0; i <= numLevels; i++) {
    localStorage.removeItem(`level${i}`);
    localStorage.removeItem(`deathCountLevel-${i}`);
  }
};

const isLevelCompleted = (i) => {
  const levelCompleteState = getItem(`level${i}`);
  return levelCompleteState === 'true' || levelCompleteState == 'false';
};
