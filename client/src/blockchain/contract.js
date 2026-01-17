import { ethers } from "ethers";
import abi from "./CrowdFundingABI.json";
import { CONTRACT_ADDRESS } from "./config";
import { getProvider, getSigner } from "./wallet";

/**
 * Get contract instance with signer (for write operations)
 * @returns {Promise<ethers.Contract|null>}
 */
export async function getContract() {
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0xYOUR_DEPLOYED_CONTRACT_ADDRESS") {
    throw new Error("Contract address not configured. Please set CONTRACT_ADDRESS in config.js");
  }

  const signer = await getSigner();
  if (!signer) {
    throw new Error("No signer available. Please connect your wallet.");
  }

  return new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);
}

/**
 * Get contract instance with provider (for read operations)
 * @returns {ethers.Contract|null}
 */
export function getContractReadOnly() {
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0xYOUR_DEPLOYED_CONTRACT_ADDRESS") {
    throw new Error("Contract address not configured. Please set CONTRACT_ADDRESS in config.js");
  }

  const provider = getProvider();
  if (!provider) {
    throw new Error("No provider available. Please install MetaMask.");
  }

  return new ethers.Contract(CONTRACT_ADDRESS, abi.abi, provider);
}

/**
 * Create a new campaign
 * @param {string} owner - Campaign owner address
 * @param {string} title - Campaign title
 * @param {string} description - Campaign description
 * @param {string} target - Funding target in ETH (will be converted to Wei)
 * @param {number} deadline - Deadline timestamp (Unix timestamp in seconds)
 * @param {string} image - Campaign image URL
 * @returns {Promise<ethers.ContractTransactionResponse>}
 */
export async function createCampaign(owner, title, description, target, deadline, image) {
  try {
    const contract = await getContract();

    // Convert ETH to Wei
    const targetWei = ethers.parseEther(target.toString());

    // Ensure deadline is in seconds (not milliseconds)
    const deadlineSeconds = Math.floor(deadline / 1000);

    const tx = await contract.createCampaign(
      owner,
      title,
      description,
      targetWei,
      deadlineSeconds,
      image
    );

    return tx;
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw error;
  }
}

/**
 * Donate to a campaign
 * @param {number} campaignId - Campaign ID
 * @param {string} amount - Donation amount in ETH (will be converted to Wei)
 * @returns {Promise<ethers.ContractTransactionResponse>}
 */
export async function donateToCampaign(campaignId, amount) {
  try {
    const contract = await getContract();

    // Convert ETH to Wei
    const amountWei = ethers.parseEther(amount.toString());

    const tx = await contract.donateToCampaign(campaignId, {
      value: amountWei,
    });

    return tx;
  } catch (error) {
    console.error("Error donating to campaign:", error);
    throw error;
  }
}

/**
 * Get campaigns with pagination
 * @param {number} offset - Start index (default 0)
 * @param {number} limit - Max items to return (default 20)
 * @returns {Promise<Array>} Array of formatted campaign objects
 */
export async function getCampaigns(offset = 0, limit = 20) {
  try {
    const contract = getContractReadOnly();
    // Using the new paginated function from smart contract
    // Returns CampaignInfo struct which is lighter (no arrays)
    const campaigns = await contract.getCampaigns(offset, limit);

    // Transform the data
    // Note: Donators and donations are NOT included in the list view anymore for performance
    return campaigns.map((campaign, index) => {
      return formatCampaign(campaign, index, campaign.donators, campaign.donations);
    });

  } catch (error) {
    console.error("Error getting campaigns:", error);
    throw error;
  }
}

/**
 * Get a single campaign by ID
 * @param {number} campaignId - Campaign ID
 * @returns {Promise<Object>} Campaign object
 */
export async function getCampaign(campaignId) {
  try {
    const contract = getContractReadOnly();
    // Use getCampaign function which returns full struct including state and arrays
    const campaign = await contract.getCampaign(campaignId);

    // Campaign struct in Solidity includes donators and donations
    // We pass them explicitly to formatCampaign
    return formatCampaign(campaign, campaignId, campaign.donators, campaign.donations);
  } catch (error) {
    console.error("Error getting campaign:", error);
    throw error;
  }
}

/**
 * Get donators for a campaign
 * @param {number} campaignId - Campaign ID
 * @returns {Promise<{donators: Array, donations: Array}>}
 */
export async function getDonators(campaignId) {
  try {
    const contract = getContractReadOnly();
    const [donators, donations] = await contract.getDonators(campaignId);

    return {
      donators: donators,
      donations: donations.map(d => ethers.formatEther(d)),
    };
  } catch (error) {
    console.error("Error getting donators:", error);
    throw error;
  }
}

/**
 * Get total number of campaigns
 * @returns {Promise<number>}
 */
export async function getNumberOfCampaigns() {
  try {
    const contract = getContractReadOnly();
    const count = await contract.numberOfCampaigns();
    return Number(count);
  } catch (error) {
    console.error("Error getting number of campaigns:", error);
    throw error;
  }
}

/**
 * Wait for transaction to be mined
 * @param {ethers.ContractTransactionResponse} tx - Transaction response
 * @returns {Promise<ethers.ContractTransactionReceipt>}
 */
export async function waitForTransaction(tx) {
  try {
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error waiting for transaction:", error);
    throw error;
  }
}

/**
 * Finalize a campaign (mark as successful or failed after deadline)
 * @param {number} campaignId - Campaign ID
 * @returns {Promise<ethers.ContractTransactionResponse>}
 */
export async function finalizeCampaign(campaignId) {
  try {
    const contract = await getContract();
    const tx = await contract.finalizeCampaign(campaignId);
    return tx;
  } catch (error) {
    console.error("Error finalizing campaign:", error);
    throw error;
  }
}

/**
 * Withdraw funds from a successful campaign (owner only)
 * @param {number} campaignId - Campaign ID
 * @returns {Promise<ethers.ContractTransactionResponse>}
 */
export async function withdrawFunds(campaignId) {
  try {
    const contract = await getContract();
    const tx = await contract.withdrawFunds(campaignId);
    return tx;
  } catch (error) {
    console.error("Error withdrawing funds:", error);
    throw error;
  }
}

/**
 * Claim refund for a failed campaign
 * @param {number} campaignId - Campaign ID
 * @returns {Promise<ethers.ContractTransactionResponse>}
 */
export async function claimRefund(campaignId) {
  try {
    const contract = await getContract();
    const tx = await contract.claimRefund(campaignId);
    return tx;
  } catch (error) {
    console.error("Error claiming refund:", error);
    throw error;
  }
}

/**
 * Get contribution amount for a specific donor in a campaign
 * @param {number} campaignId - Campaign ID
 * @param {string} donorAddress - Donor address
 * @returns {Promise<string>} Contribution amount in ETH
 */
export async function getContribution(campaignId, donorAddress) {
  try {
    const contract = getContractReadOnly();
    const contribution = await contract.getContribution(campaignId, donorAddress);
    return ethers.formatEther(contribution);
  } catch (error) {
    console.error("Error getting contribution:", error);
    throw error;
  }
}

/**
 * Get contract balance
 * @returns {Promise<string>} Contract balance in ETH
 */
export async function getContractBalance() {
  try {
    const contract = getContractReadOnly();
    const balance = await contract.getContractBalance();
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Error getting contract balance:", error);
    throw error;
  }
}

/**
 * Format campaign data with state handling
 * CampaignState enum: 0=Active, 1=Successful, 2=Failed, 3=Withdrawn
 * @param {Object} campaignData - Raw campaign data from contract
 * @param {number} id - Campaign ID
 * @param {Array} donators - Array of donator addresses
 * @param {Array} donations - Array of donation amounts
 * @returns {Object} Formatted campaign object
 */
export function formatCampaign(campaignData, id, donators = [], donations = []) {
  // Handle state enum: 0=Active, 1=Successful, 2=Failed, 3=Withdrawn
  const state = campaignData.state !== undefined ? Number(campaignData.state) : 0;
  let status = 'active';
  if (state === 1) status = 'successful';
  else if (state === 2) status = 'failed';
  else if (state === 3) status = 'withdrawn';

  return {
    id: id.toString(),
    owner: campaignData.owner,
    title: campaignData.title,
    description: campaignData.description,
    target: ethers.formatEther(campaignData.target || campaignData.goal || 0),
    goal: ethers.formatEther(campaignData.target || campaignData.goal || 0),
    deadline: Number(campaignData.deadline) * 1000, // Convert to milliseconds
    amountCollected: ethers.formatEther(campaignData.amountCollected || 0),
    raised: ethers.formatEther(campaignData.amountCollected || 0),
    image: campaignData.image || campaignData.imageUrl || '',
    imageUrl: campaignData.image || campaignData.imageUrl || '',
    donators: donators || campaignData.donators || [],
    donations: (donations || campaignData.donations || []).map(d =>
      typeof d === 'string' ? d : ethers.formatEther(d)
    ),
    status: status,
    state: state,
    creator: campaignData.owner,
    currency: 'MATIC',
    category: 'General',
    milestones: [],
    contributions: [],
    rewardTiers: [],
  };
}

/**
 * Format error message for user display
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export function formatError(error) {
  if (error.code === "ACTION_REJECTED") {
    return "Transaction was rejected. Please try again.";
  }

  if (error.code === "INSUFFICIENT_FUNDS") {
    return "Insufficient funds. Please check your balance.";
  }

  if (error.message.includes("user rejected")) {
    return "Transaction was rejected. Please try again.";
  }

  if (error.message.includes("network")) {
    return "Network error. Please check your connection and try again.";
  }

  if (error.message.includes("missing revert data")) {
    return "Could not connect to the contract. Please ensure you are on the Localhost network and the node is running.";
  }

  return error.message || "An error occurred. Please try again.";
}
