import { loadScript } from './utils';

let pokiSdk;
export const initPokiSdk = () => {
  if (!location.href.match('poki')) {
    return Promise.reject(null);
  }
  return loadPokiSdk().then(() => {
    pokiSdk = window.PokiSDK;
    return pokiSdk
      .init()
      .then(() => {
        console.log('Poki SDK successfully initialized');
        pokiSdk.gameLoadingFinished();
        return pokiSdk;
        // fire your function to continue to game
      })
      .catch(() => {
        console.log('Initialized, but the user likely has adblock');
        // fire your function to continue to game
        return null;
      });
  });
};

const loadPokiSdk = () => {
  return loadScript('https://game-cdn.poki.com/scripts/v2/poki-sdk.js');
};
