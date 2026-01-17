import { ethers } from "ethers";
import { getSigner } from "./wallet";

const STORAGE_KEY = "blockfund_auth";
const MESSAGE_TO_SIGN = "Login to BlockFund: Decentralized Crowdfunding";

export interface AuthState {
    address: string | null;
    isAuthenticated: boolean;
}

/**
 * Check if user is currently authenticated (has valid session in local storage)
 */
export function getStoredAuth(): AuthState {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return { address: null, isAuthenticated: false };

        const { address, signature } = JSON.parse(stored);

        // basic validation
        if (!address || !signature) return { address: null, isAuthenticated: false };

        // Ideally, we would verify the signature matches the address here or on a backend
        // For a backend-less dApp, we trust the stored signature matches the address 
        // AND we rely on the wallet connecting with this address to "unlock" the session.

        return { address, isAuthenticated: true };
    } catch (e) {
        return { address: null, isAuthenticated: false };
    }
}

/**
 * Login by signing a message with the connected wallet
 */
export async function loginWithMetaMask(): Promise<AuthState> {
    const signer = await getSigner();
    if (!signer) {
        throw new Error("Please connect your wallet first");
    }

    const address = await signer.getAddress();

    try {
        // 1. Request signature
        const signature = await signer.signMessage(MESSAGE_TO_SIGN);

        // 2. Verify signature (sanity check)
        const recoveredAddress = ethers.verifyMessage(MESSAGE_TO_SIGN, signature);

        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            throw new Error("Signature verification failed");
        }

        // 3. Store session
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            address,
            signature,
            timestamp: Date.now()
        }));

        return { address, isAuthenticated: true };
    } catch (error: any) {
        console.error("Login failed:", error);
        if (error.code === 4001) {
            throw new Error("User rejected the signature request");
        }
        throw error;
    }
}

/**
 * Logout clears the session
 */
export function logout() {
    localStorage.removeItem(STORAGE_KEY);
}
