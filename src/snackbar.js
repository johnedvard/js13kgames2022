import skull from 'data-url:./assets/img/sage_head_game_large.png';
import sageTxt from 'data-url:./assets/img/Sage.svg';
import closeIcon from 'data-url:./assets/img/close-icon.svg';
import { shuffleArray } from './utils';

export const messages = shuffleArray([
  'You know what they say — measure twice, cut once, and never let a kindly sage fall into the endless void! Even if he happens to be a metaphor.',
  "Though the first True Arcadians ascended beyond the world long ago, the five Classes are still practiced by their mortal descendants. Yet even the most powerful mortals can't hope to stand against you!",
  "Ah, the eyes! The windows to the soul, or so the poets say. I don't put much stock in poetry myself, but it's a fine enough sentiment.",
  'I know things may look strange now, but if you find balance here, your first days on the surface will be much easier to adapt to. You and your fellow True Arcadians will accomplish great things!',
  'The strength of a True Arcadian comes from within, and from your connection to the time before the Shattering. Physical appearance may change how others see you, but it has no bearing on your power.',
  'Do I have something in my teeth? Goodness, I hope not.',
  "If only someone like me had greeted the first True Arcadians before their arrival. Imagine what they could have done! Though I suppose once you arrive, we won't have to imagine much longer...",
  "To think that you'll see the surface world soon — it's the culmination of so much work, so many dreams... Do not waste this opportunity, Arcadian. Yours is a gift too precious to squander.",
]);

const getSnackBarMsg = (msg) => {
  return `<div id='snackbar'>
  <div id="snackbar-profile">
    <img id="snackbar-skull" src="${skull}">
    <img id="snackbar-sage-txt" src="${sageTxt}">
  </div>
  <div id="snackbar-msg">${msg}</div>
  <img id="snackbar-close-icon" src="${closeIcon}" >
</div>
`;
};

let dismissTimeout;
let currentMsgIndex = 0;

export const displaySnackbar = () => {
  const msg = messages[currentMsgIndex];
  currentMsgIndex = (currentMsgIndex + 1) % messages.length;
  const snackbarSpawnPoint = document.querySelector(
    '#hang-by-a-thread #wrap #snackbar-spawn-point'
  );
  snackbarSpawnPoint.addEventListener('click', hideSnackbar);
  snackbarSpawnPoint.innerHTML = getSnackBarMsg(msg);
  snackbarSpawnPoint.classList.remove('dismiss');
  snackbarSpawnPoint.classList.add('appear');
  // TODO (johnedvard) Prevent hiding the snackbar when hover over -> restart timeout
  if (dismissTimeout) clearTimeout(dismissTimeout);
  dismissTimeout = setTimeout(hideSnackbar, 4000);
};

export const hideSnackbar = () => {
  const snackbarSpawnPoint = document.querySelector(
    '#hang-by-a-thread #wrap #snackbar-spawn-point'
  );
  snackbarSpawnPoint.removeEventListener('click', hideSnackbar);
  snackbarSpawnPoint.classList.remove('appear');
  snackbarSpawnPoint.classList.add('dismiss');
  clearTimeout(dismissTimeout);
};
