import { emit } from 'kontra';

import { MONETIZATION_PROGRESS } from './gameEvents';
import { setIsSubscriber } from './store';

export const initMonetization = () => {
  if (document && document.monetization) {
    document.monetization.addEventListener('monetizationprogress', (evt) =>
      handleSubscription(evt)
    );
  } else {
    window.addEventListener('monetizationprogress', (evt) =>
      handleSubscription(evt)
    );
  }
};
const handleSubscription = (evt) => {
  setIsSubscriber();
  emit(MONETIZATION_PROGRESS, evt);
};
