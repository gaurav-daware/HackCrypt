// Localhost Hardhat Configuration

export const LOCAL_CHAIN_ID = 31337;
export const LOCAL_RPC_URL = "http://127.0.0.1:8545";
export const LOCAL_BLOCK_EXPLORER = "http://localhost:8545";

// Deployed contract address (Hardhat default)
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// MetaMask network config
export const LOCAL_NETWORK = {
  chainId: `0x${LOCAL_CHAIN_ID.toString(16)}`,
  chainName: "Hardhat Localhost",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: [LOCAL_RPC_URL],
  blockExplorerUrls: [LOCAL_BLOCK_EXPLORER],
};
