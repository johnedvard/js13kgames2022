export const initGameHints = (levelId) => {
  const txt = '\nCut the rope with "S".';
  const hintEl = document.getElementById('hint');
  hintEl.textContent = '';
  switch (levelId) {
    case 1:
      hintEl.textContent =
        'Reach the goal. \nCut the rope with "S" or\n with your finger or mouse ';
      break;
    case 2:
      hintEl.textContent = 'Use "Up Arrow" to shorten the rope';
      break;
    case 3:
      hintEl.textContent = 'Use "Space" to boost up.' + txt;
      break;
  }
};
