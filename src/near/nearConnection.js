import getConfig from './config';

export class NearConnection {
  walletConnection;
  contract;
  accountId;
  userName;
  ready; //promise
  nearConfig = getConfig('development');
  resolveContract;
  constructor() {
    this.ready = new Promise((resolve, reject) => {
      this.resolveContract = resolve;
    });
  }

  // Initialize contract & set global variables
  async initContract() {
    // Initialize connection to the NEAR testnet
    const keyStore = new window.nearApi.keyStores.BrowserLocalStorageKeyStore();
    const near = await window.nearApi.connect({ ...this.nearConfig, keyStore });

    // Initializing Wallet based Account. It can work with NEAR testnet wallet that
    // is hosted at https://wallet.testnet.near.org
    this.walletConnection = new window.nearApi.WalletConnection(near, null);

    // Getting the Account ID. If still unauthorized, it's just empty string
    this.accountId = this.walletConnection.getAccountId();

    // Initializing our contract APIs by contract name and configuration
    this.contract = await new window.nearApi.Contract(
      this.walletConnection.account(),
      this.nearConfig.contractName,
      {
        // View methods are read only. They don't modify the state, but usually return some value.
        viewMethods: ['getScores', 'getScore', 'getName'],
        // Change methods can modify the state. But you don't receive the returned value when called.
        changeMethods: ['setGreeting', 'setScore', 'setName'],
      }
    );
    this.resolveContract();

    return this.walletConnection;
  }

  logout() {
    this.walletConnection.signOut();
    // reload page
  }
  login() {
    // Allow the current app to make calls to the specified contract on the
    // user's behalf.
    // This works by creating a new access key for the user's account and storing
    // the private key in localStorage.
    this.walletConnection.requestSignIn(this.nearConfig.contractName);
  }

  setScore(levelName, score, name) {
    const json = JSON.stringify({ score, name });
    return this.contract.setScore({
      levelName,
      json,
    });
  }

  getScores(levelName) {
    const scoreBoard = this.contract.getScores({ levelName });
    return scoreBoard;
  }

  getScore(levelName) {
    const accountId = this.accountId;
    return this.contract.getScore({ levelName, accountId });
  }

  setName(name) {
    if (
      name &&
      name != this.userName &&
      this.walletConnection &&
      this.walletConnection.isSignedIn()
    ) {
      this.userName = name;
      return this.contract.setName({ name });
    }
    return Promise.resolve();
  }

  async getName() {
    if (this.userName) {
      return Promise.resolve(this.userName);
    }
    const accountId = this.accountId;
    return new Promise((resolve, reject) => {
      this.contract
        .getName({ accountId })
        .then((res) => {
          if (res && res.match(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/g)) {
            this.userName = 'Invalid username';
          } else {
            this.userName = res;
          }
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
