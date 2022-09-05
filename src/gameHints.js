export const initGameHints = (levelId) => {
  const hintEl = document.getElementById('hint');
  hintEl.textContent = '';
  switch (levelId) {
    case 1:
      hintEl.textContent =
        'Reach the goal below.\nUse the arrow keys (⬅️ ➡️) to move.\nCut the rope with "S".';
      break;
    case 2:
      hintEl.textContent = 'Use "Up Arrow" to shorten the rope';
      break;
    case 3:
      hintEl.textContent =
        'Use "Space" to give you a boost upwards.\n Cut the rope with "S".';
      break;
  }
};
