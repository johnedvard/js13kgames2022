import { Game } from './Game';
import { NearConnection } from './near/nearConnection';
import { initLoginLogout } from './near/nearLogin';
const init = () => {
  new Game();
  const nearConnection = new NearConnection();
  nearConnection.initContract().then((res) => {
    initLoginLogout(nearConnection);
  });
};

init();
