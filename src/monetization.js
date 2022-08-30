import { MONETIZATION_PROGRESS } from './gameEvents';

export const initMonetization = () => {
  if (document && document.monetization) {
    document.monetization.addEventListener('monetizationprogress', (evt) =>
      emit(MONETIZATION_PROGRESS, evt)
    );
  } else {
    window.addEventListener('monetizationprogress', (evt) =>
      emit(MONETIZATION_PROGRESS, evt)
    );
  }
};
