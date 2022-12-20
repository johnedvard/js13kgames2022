export const initGameHints = (levelId) => {
  const hintEl = document.getElementById('hint');
  hintEl.textContent = '';
  switch (levelId) {
    case 1:
      hintEl.textContent =
        'Reach the goal. \nCut the rope with "S" or\n with your finger or mouse ';
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
