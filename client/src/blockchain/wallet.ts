import { ethers } from "ethers";
import { LOCAL_CHAIN_ID, LOCAL_NETWORK } from "./config";

// Add window.ethereum type definition
// Add window.ethereum type definition
declare global {
    interface Window {
        ethereum: any;
    }
}

// Types for better type safety
export interface WalletState {
    address: string | null;
    chainId: number | null;
    isConnected: boolean;
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
}

/**
 * Get the current network chain ID with error handling
 */
export async function getCurrentChainId(): Promise<number> {
    if (!isMetaMaskInstalled()) {
        throw new Error("MetaMask is not installed");
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        return Number(network.chainId);
    } catch (error) {
        console.error("Error getting chain ID:", error);
        throw new Error("Failed to get network information");
    }
}

/**
 * Check if connected to Localhost network
 */
export async function isLocalNetwork(): Promise<boolean> {
    try {
        const chainId = await getCurrentChainId();
        return chainId === LOCAL_CHAIN_ID;
    } catch (error) {
        console.error("Error checking network:", error);
        return false;
    }
}

/**
 * Switch to Localhost network with better error handling
 */
export async function switchToLocalNetwork(): Promise<void> {
    if (!isMetaMaskInstalled()) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
    }

    try {
        // Try to switch to Localhost
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: LOCAL_NETWORK.chainId }],
        });
    } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902 || switchError.code === -32603) {
            try {
                // Add Localhost network to MetaMask
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [LOCAL_NETWORK],
                });
            } catch (addError: any) {
                console.error("Failed to add network:", addError);
                throw new Error("Failed to add Localhost network to MetaMask");
            }
        } else if (switchError.code === 4001) {
            // User rejected the request
            throw new Error("Network switch cancelled by user");
        } else {
            console.error("Network switch error:", switchError);
            throw new Error("Failed to switch network");
        }
    }
}

/**
 * Connect to MetaMask wallet with improved flow
 * @returns {Promise<string>} Connected wallet address
 */
export async function connectWallet(): Promise<string> {
    if (!isMetaMaskInstalled()) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);

        // Request account access
        const accounts = await provider.send("eth_requestAccounts", []);

        if (accounts.length === 0) {
            throw new Error("No accounts found. Please unlock MetaMask.");
        }

        const address = accounts[0];

        // Check if connected to Localhost
        const isCorrectNetwork = await isLocalNetwork();

        if (!isCorrectNetwork) {
            // Automatically attempt to switch (better UX than confirm dialog)
            try {
                await switchToLocalNetwork();
            } catch (switchError: any) {
                // If user cancels, still return the address but notify them
                console.warn("Network switch cancelled:", switchError);
                throw new Error("Please switch to Localhost testnet to use this app.");
            }
        }

        return address;
    } catch (error: any) {
        console.error("Error connecting wallet:", error);

        // Provide more specific error messages
        if (error.code === 4001) {
            throw new Error("Connection cancelled by user");
        } else if (error.code === -32002) {
            throw new Error("Connection request already pending. Please check MetaMask.");
        }

        throw error;
    }
}

/**
 * Get the current connected account
 * @returns {Promise<string|null>} Current account address or null
 */
export async function getCurrentAccount(): Promise<string | null> {
    if (!isMetaMaskInstalled()) {
        return null;
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
        console.error("Error getting current account:", error);
        return null;
    }
}

/**
 * Get provider instance with caching
 */
let cachedProvider: ethers.BrowserProvider | null = null;

export function getProvider(): ethers.BrowserProvider | null {
    if (!isMetaMaskInstalled()) {
        return null;
    }

    // Return cached provider to avoid creating multiple instances
    if (!cachedProvider) {
        cachedProvider = new ethers.BrowserProvider(window.ethereum);
    }

    return cachedProvider;
}

/**
 * Clear cached provider (useful when network changes)
 */
export function clearProviderCache(): void {
    cachedProvider = null;
}

/**
 * Get signer instance with better error handling
 * @returns {Promise<ethers.JsonRpcSigner|null>}
 */
export async function getSigner(): Promise<ethers.JsonRpcSigner | null> {
    const provider = getProvider();
    if (!provider) {
        return null;
    }

    try {
        const signer = await provider.getSigner();
        return signer;
    } catch (error: any) {
        console.error("Error getting signer:", error);

        // Check if user needs to connect wallet first
        if (error.code === "UNKNOWN_ERROR" || error.message?.includes("unknown account")) {
            throw new Error("Please connect your wallet first");
        }

        return null;
    }
}

/**
 * Get wallet balance
 * @param {string} address - Wallet address
 * @returns {Promise<string>} Balance in ETH
 */
export async function getBalance(address: string): Promise<string> {
    const provider = getProvider();
    if (!provider) {
        throw new Error("Provider not available");
    }

    try {
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
    } catch (error) {
        console.error("Error getting balance:", error);
        throw new Error("Failed to get wallet balance");
    }
}

/**
 * Listen for account changes with cleanup
 * @param {Function} callback - Callback function with new account address
 * @returns {Function} Cleanup function
 */
export function onAccountsChanged(callback: (address: string | null) => void): () => void {
    if (!isMetaMaskInstalled()) {
        return () => { };
    }

    const handler = (accounts: string[]) => {
        const address = accounts.length > 0 ? accounts[0] : null;
        callback(address);

        // Clear provider cache when account changes
        clearProviderCache();
    };

    window.ethereum.on("accountsChanged", handler);

    // Return cleanup function
    return () => {
        window.ethereum.removeListener("accountsChanged", handler);
    };
}

/**
 * Listen for chain changes with cleanup
 * @param {Function} callback - Callback function with new chain ID
 * @returns {Function} Cleanup function
 */
export function onChainChanged(callback: (chainId: number) => void): () => void {
    if (!isMetaMaskInstalled()) {
        return () => { };
    }

    const handler = (chainIdHex: string) => {
        const chainId = parseInt(chainIdHex, 16);
        callback(chainId);

        // Clear provider cache when chain changes
        clearProviderCache();
    };

    window.ethereum.on("chainChanged", handler);

    // Return cleanup function
    return () => {
        window.ethereum.removeListener("chainChanged", handler);
    };
}

/**
 * Listen for disconnection events
 * @param {Function} callback - Callback function
 * @returns {Function} Cleanup function
 */
export function onDisconnect(callback: () => void): () => void {
    if (!isMetaMaskInstalled()) {
        return () => { };
    }

    window.ethereum.on("disconnect", callback);

    return () => {
        window.ethereum.removeListener("disconnect", callback);
    };
}

/**
 * Remove all event listeners
 */
export function removeListeners(): void {
    if (!isMetaMaskInstalled()) {
        return;
    }

    window.ethereum.removeAllListeners("accountsChanged");
    window.ethereum.removeAllListeners("chainChanged");
    window.ethereum.removeAllListeners("disconnect");

    // Clear cached provider
    clearProviderCache();
}

/**
 * Format address for display (0x1234...5678)
 * @param {string} address - Full address
 * @param {number} chars - Number of characters to show on each side
 * @returns {string} Formatted address
 */
export function formatAddress(address: string, chars: number = 4): string {
    if (!address) return "";
    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} Whether address is valid
 */
export function isValidAddress(address: string): boolean {
    try {
        return ethers.isAddress(address);
    } catch {
        return false;
    }
}
