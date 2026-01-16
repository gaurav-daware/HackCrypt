// Polygon Amoy Testnet Configuration
export const POLYGON_AMOY_CHAIN_ID = 80002;
export const POLYGON_AMOY_RPC_URL = "https://rpc-amoy.polygon.technology/";
export const POLYGON_AMOY_BLOCK_EXPLORER = "https://amoy.polygonscan.com/";

// Replace with your deployed contract address
export const CONTRACT_ADDRESS = "0x7177cDef8cB1CA8A23aB40899a4455a55F303e3c";

// Network configuration for MetaMask
export const POLYGON_AMOY_NETWORK = {
  chainId: `0x${POLYGON_AMOY_CHAIN_ID.toString(16)}`,
  chainName: "Polygon Amoy",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  rpcUrls: [POLYGON_AMOY_RPC_URL],
  blockExplorerUrls: [POLYGON_AMOY_BLOCK_EXPLORER],
};
