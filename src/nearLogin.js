export const loginout = (loginoutEl, nearConnection) => {
  if (!nearConnection) return;
  if (nearConnection.walletConnection.isSignedIn()) {
    nearConnection.logout();
    loginoutEl.innerHTML = 'Login to NEAR';
  } else {
    nearConnection.login();
    loginoutEl.innerHTML = 'Logout from NEAR';
  }
};

export const initLoginLogout = (nearConnection) => {
  const loginoutEl = document.getElementById('lo');
  if (nearConnection && nearConnection.isSignedIn()) {
    loginoutEl.innerHTML = 'Logout from NEAR';
    const nearLevelBtn = document.getElementById('near');
    nearLevelBtn.classList.remove('disabled');
    nearLevelBtn.removeAttribute('disabled');
  } else {
    loginoutEl.innerHTML = 'Login to NEAR';
  }
  loginoutEl.addEventListener('click', () =>
    loginout(loginoutEl, nearConnection)
  );
};
