// Export all wallet functions
export {
  connectWallet,
  getCurrentAccount,
  getProvider,
  getSigner,
  switchToLocalNetwork,
  isLocalNetwork,
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
  LOCAL_CHAIN_ID,
  LOCAL_RPC_URL,
  LOCAL_BLOCK_EXPLORER,
  LOCAL_NETWORK,
} from './config';
