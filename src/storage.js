// localStorage does not work in ingognito mode, so we need to wrap it in try catch, ref https://sdk.poki.com/requirements.html#incognito-support
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.error(err);
  }
};

export const getItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.error(err);
  }
};
