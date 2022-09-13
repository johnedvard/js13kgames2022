const CONTARCT_NAME_TESTNET = 'paras-token-v2.testnet';
export const getConfig = () => {
  return {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    contractName: CONTARCT_NAME_TESTNET,
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',
  };
};
