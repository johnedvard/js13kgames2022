export const initGameHints = (levelId) => {
  const hintEl = document.getElementById('hint');
  hintEl.textContent = '';
  switch (levelId) {
    case 1:
      hintEl.textContent = 'Reach the goal below. \nCut the rope with "S".';
      break;
    case 2:
      hintEl.textContent =
        'Use the arrow keys to move.\n Use "Space" to boost up.';
      break;
    case 3:
      hintEl.textContent = '';
      break;
  }
};
