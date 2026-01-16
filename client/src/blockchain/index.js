// Export all wallet functions
export {
  connectWallet,
  getCurrentAccount,
  getProvider,
  getSigner,
  switchToPolygonAmoy,
  isPolygonAmoy,
  isMetaMaskInstalled,
  onAccountsChanged,
  onChainChanged,
  removeListeners,
} from './wallet';

// Export all contract functions
export {
  getContract,
  getContractReadOnly,
  createCampaign,
  donateToCampaign,
  getCampaigns,
  getCampaign,
  getDonators,
  getNumberOfCampaigns,
  waitForTransaction,
  formatError,
  formatCampaign,
  finalizeCampaign,
  withdrawFunds,
  claimRefund,
  getContribution,
  getContractBalance,
} from './contract';

// Export config
export {
  CONTRACT_ADDRESS,
  POLYGON_AMOY_CHAIN_ID,
  POLYGON_AMOY_RPC_URL,
  POLYGON_AMOY_BLOCK_EXPLORER,
  POLYGON_AMOY_NETWORK,
} from './config';
