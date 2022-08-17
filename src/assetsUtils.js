import { load } from 'kontra';
import skull from './assets/img/skull.png';
import chain from './assets/img/chain.png';
import saw from './assets/img/saw.png';

export const initAssets = () => {
  load(skull, chain, saw)
    .then(function (assets) {
      console.log('assets loaded');
      // all assets have loaded
    })
    .catch(function (err) {
      console.log('assets did not loaded', err);
    });
};
