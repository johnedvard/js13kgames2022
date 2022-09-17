import { emit } from 'kontra';
import { LOGIN_NEAR, LOGOUT_NEAR } from '../uiEvents';

export const loginout = (loginoutEl, nearConnection) => {
  if (!nearConnection) return;
  if (nearConnection.walletConnection.isSignedIn()) {
    emit(LOGOUT_NEAR, {});
    nearConnection.logout();
    loginoutEl.innerHTML = 'Login to NEAR';
  } else {
    emit(LOGIN_NEAR, {});
    nearConnection.login();
    loginoutEl.innerHTML = 'Logout from NEAR';
  }
};

export const initLoginLogout = (nearConnection) => {
  const loginoutEl = document.getElementById('near-login-loading-btn');
  if (nearConnection && nearConnection.isSignedIn()) {
    loginoutEl.innerHTML = 'Logout from NEAR';
    const nearLevelBtn = document.getElementById('near-level-btn');
    nearLevelBtn.classList.remove('disabled');
    nearLevelBtn.removeAttribute('disabled');
  } else {
    loginoutEl.innerHTML = 'Login to NEAR';
  }
  loginoutEl.addEventListener('click', () => {
    loginout(loginoutEl, nearConnection);
  });
};
