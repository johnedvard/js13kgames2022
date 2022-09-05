import { on } from '../kontra';
import { NFT_MINT } from '../gameEvents';
import getConfig from './config';

export const HANG_BY_A_THREAD_SERIES_TESTNET = '2036';
export const MIRRORS_SERIES_TESTNET = '494';
export const PARAS_BASE_PATH_TESTNET =
  'https://testnet.paras.id/token/paras-token-v2.testnet::';
export const IPFS_BASE_PATH = 'https://ipfs.fleek.co/ipfs/';
export const PARAS_COLLECTION_API =
  'https://api-v3-marketplace-testnet.paras.id/token-series?collection_id=hang-by-a-thread-by-johnonymtestnet';

export class NearConnection {
  walletConnection;
  contract;
  accountId;
  userName;
  ready; //promise
  nearConfig = getConfig('development');
  resolveContract;

  constructor() {
    this.listenForGameEvents();
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
        viewMethods: ['nft_tokens_for_owner', 'nft_tokens_by_series'],
        // Change methods can modify the state. But you don't receive the returned value when called.
        changeMethods: ['nft_mint'],
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

  nft_tokens_for_owner(account_id) {
    return this.contract.nft_tokens_for_owner({ account_id });
  }

  nft_tokens_by_series(token_series_id) {
    return this.contract.nft_tokens_by_series({ token_series_id });
  }
  nft_mint({ token_series_id, priceInYoctoNear }) {
    return this.contract.nft_mint(
      {
        owner_id: this.accountId,
        receiver_id: this.accountId,
        token_series_id,
      },
      '300000000000000',
      priceInYoctoNear
    );
  }
  getNftCollections() {
    return fetch(PARAS_COLLECTION_API)
      .then((res) => res.json())
      .then((res) => {
        return res.data.results.filter(
          (data) => data.metadata.copies > 0 && !data.is_non_mintable
        );
      });
  }
  listenForGameEvents() {
    on(NFT_MINT, ({ token_series_id, priceInYoctoNear }) =>
      this.nft_mint({ token_series_id, priceInYoctoNear })
    );
  }
}
