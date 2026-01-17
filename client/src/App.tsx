import { useState, useEffect, useCallback, useRef } from 'react';
import { CampaignList } from './components/CampaignList';
import { CampaignDetail } from './components/CampaignDetail';
import { CreateCampaign } from './components/CreateCampaign';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TransactionHistory } from './components/TransactionHistory';
import {
  connectWallet,
  getCurrentAccount,
  onAccountsChanged,
  onChainChanged,
  removeListeners,
  isLocalNetwork,
} from './blockchain/wallet';
import {
  getCampaigns,
  finalizeCampaign,
  withdrawFunds,
  claimRefund,
  waitForTransaction,
  formatError,
} from './blockchain/contract';
import { toast } from 'sonner';

export type Milestone = {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  unlocked: boolean;
  votesFor: number;
  votesAgainst: number;
  released: boolean;
};

export type Contribution = {
  id: string;
  campaignId: string;
  contributor: string;
  amount: number;
  currency: string;
  timestamp: number;
  txHash: string;
  rewardTier?: string;
};

export type Campaign = {
  id: string;
  title: string;
  creator: string;
  description: string;
  goal: number;
  raised: number;
  currency: string;
  deadline: number;
  category: string;
  imageUrl: string;
  milestones: Milestone[];
  contributions: Contribution[];
  status: 'active' | 'successful' | 'failed' | 'withdrawn';
  rewardTiers: RewardTier[];
};

export type RewardTier = {
  id: string;
  title: string;
  amount: number;
  description: string;
  backers: number;
  maxBackers?: number;
};

export default function App() {
  const [view, setView] = useState<'explore' | 'create' | 'dashboard' | 'history'>('explore');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [networkError, setNetworkError] = useState<string>('');

  // Use refs to track cleanup and prevent memory leaks
  const isUnmounted = useRef(false);
  const accountsChangedCleanup = useRef<(() => void) | null>(null);
  const chainChangedCleanup = useRef<(() => void) | null>(null);

  // Load campaigns from blockchain with better error handling
  const loadCampaigns = useCallback(async () => {
    if (isUnmounted.current) return;

    try {
      setLoadingCampaigns(true);
      setNetworkError('');

      // Check if on correct network
      const isCorrectNetwork = await isLocalNetwork();
      if (!isCorrectNetwork) {
        setNetworkError('Please switch to Localhost testnet');
        setCampaigns([]);
        return;
      }

      const blockchainCampaigns = await getCampaigns();

      if (isUnmounted.current) return;

      // Transform blockchain campaigns to match our Campaign type
      const transformedCampaigns: Campaign[] = blockchainCampaigns.map((bc) => {
        const deadline = Number(bc.deadline);
        const now = Date.now();

        // Use state from contract
        let status: 'active' | 'successful' | 'failed' | 'withdrawn' = 'active';
        if (bc.state !== undefined) {
          const state = Number(bc.state);
          if (state === 0) status = 'active';
          else if (state === 1) status = 'successful';
          else if (state === 2) status = 'failed';
          else if (state === 3) status = 'withdrawn';
        } else {
          // Fallback: infer from deadline and amount
          status =
            deadline < now
              ? 'failed'
              : parseFloat(bc.amountCollected) >= parseFloat(bc.target)
                ? 'successful'
                : 'active';
        }

        return {
          id: bc.id,
          title: bc.title,
          creator: bc.owner,
          description: bc.description,
          goal: parseFloat(bc.target),
          raised: parseFloat(bc.amountCollected),
          currency: 'ETH',
          deadline: deadline,
          category: 'Blockchain',
          imageUrl:
            bc.image || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
          status,
          milestones: [],
          contributions: [],
          rewardTiers: [],
        };
      });

      if (!isUnmounted.current) {
        setCampaigns(transformedCampaigns);
      }
    } catch (error: any) {
      if (!isUnmounted.current) {
        console.error('Error loading campaigns:', error);
        toast.error('Failed to load campaigns from blockchain');
        setNetworkError(formatError(error));
      }
    } finally {
      if (!isUnmounted.current) {
        setLoadingCampaigns(false);
        setLoading(false);
      }
    }
  }, []);

  // Check wallet connection on mount
  useEffect(() => {
    let mounted = true;

    const checkWallet = async () => {
      try {
        const account = await getCurrentAccount();
        if (mounted && account) {
          setUserAddress(account);
          setWalletConnected(true);
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
      }
    };

    checkWallet();
    loadCampaigns();

    // Set up event listeners with cleanup functions
    accountsChangedCleanup.current = onAccountsChanged((account) => {
      if (mounted) {
        if (account) {
          setUserAddress(account);
          setWalletConnected(true);
          toast.info('Wallet account changed');
        } else {
          setUserAddress('');
          setWalletConnected(false);
          toast.info('Wallet disconnected');
        }
      }
    });

    chainChangedCleanup.current = onChainChanged(async (chainId) => {
      if (mounted) {
        toast.info('Network changed. Reloading campaigns...');
        await loadCampaigns();
      }
    });

    // Cleanup function
    return () => {
      mounted = false;
      isUnmounted.current = true;

      // Call individual cleanup functions
      if (accountsChangedCleanup.current) {
        accountsChangedCleanup.current();
      }
      if (chainChangedCleanup.current) {
        chainChangedCleanup.current();
      }
      removeListeners();
    };
  }, [loadCampaigns]);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setUserAddress(address);
      setWalletConnected(true);
      toast.success('Wallet connected successfully!');
      // Reload campaigns after connecting
      await loadCampaigns();
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = useCallback(() => {
    setUserAddress('');
    setWalletConnected(false);
    setSelectedCampaign(null);
    toast.info('Wallet disconnected');
  }, []);

  // Handle campaign creation
  const handleCreateCampaign = useCallback(async () => {
    await loadCampaigns();
    setView('explore');
  }, [loadCampaigns]);

  // Handle contribution
  const handleContribute = useCallback(
    async (campaignId: string, contribution: Contribution) => {
      // Reload campaigns from blockchain after contribution
      await loadCampaigns();

      // Update selected campaign if it's the one that was contributed to
      if (selectedCampaign?.id === campaignId) {
        const refreshed = await getCampaigns();
        const campaignIndex = parseInt(campaignId);
        const refreshedCampaign = refreshed[campaignIndex];

        if (refreshedCampaign) {
          setSelectedCampaign((prev) =>
            prev
              ? {
                ...prev,
                raised: parseFloat(refreshedCampaign.amountCollected),
                status:
                  refreshedCampaign.state === 1
                    ? 'successful'
                    : refreshedCampaign.state === 2
                      ? 'failed'
                      : refreshedCampaign.state === 3
                        ? 'withdrawn'
                        : 'active',
              }
              : null
          );
        }
      }
    },
    [selectedCampaign, loadCampaigns]
  );

  // Handle vote (placeholder for future implementation)
  const handleVote = useCallback(
    (campaignId: string, milestoneId: string, voteFor: boolean) => {
      setCampaigns((prevCampaigns) =>
        prevCampaigns.map((c) => {
          if (c.id === campaignId) {
            return {
              ...c,
              milestones: c.milestones.map((m) => {
                if (m.id === milestoneId) {
                  return {
                    ...m,
                    votesFor: voteFor ? m.votesFor + 1 : m.votesFor,
                    votesAgainst: !voteFor ? m.votesAgainst + 1 : m.votesAgainst,
                  };
                }
                return m;
              }),
            };
          }
          return c;
        })
      );
    },
    []
  );

  // Handle finalize campaign
  const handleFinalizeCampaign = useCallback(
    async (campaignId: string) => {
      try {
        const loadingToast = toast.loading('Finalizing campaign...');
        const tx = await finalizeCampaign(parseInt(campaignId));
        toast.dismiss(loadingToast);

        toast.loading('Waiting for transaction confirmation...', { id: 'waiting' });
        await waitForTransaction(tx);
        toast.dismiss('waiting');

        toast.success('Campaign finalized successfully!');
        await loadCampaigns();
      } catch (error: any) {
        console.error('Error finalizing campaign:', error);
        toast.error(formatError(error));
      }
    },
    [loadCampaigns]
  );

  // Handle withdraw funds
  const handleWithdrawFunds = useCallback(
    async (campaignId: string) => {
      try {
        const loadingToast = toast.loading('Withdrawing funds...');
        const tx = await withdrawFunds(parseInt(campaignId));
        toast.dismiss(loadingToast);

        toast.loading('Waiting for transaction confirmation...', { id: 'waiting' });
        await waitForTransaction(tx);
        toast.dismiss('waiting');

        toast.success('Funds withdrawn successfully!');
        await loadCampaigns();
      } catch (error: any) {
        console.error('Error withdrawing funds:', error);
        toast.error(formatError(error));
      }
    },
    [loadCampaigns]
  );

  // Handle claim refund
  const handleClaimRefund = useCallback(
    async (campaignId: string) => {
      try {
        const loadingToast = toast.loading('Claiming refund...');
        const tx = await claimRefund(parseInt(campaignId));
        toast.dismiss(loadingToast);

        toast.loading('Waiting for transaction confirmation...', { id: 'waiting' });
        await waitForTransaction(tx);
        toast.dismiss('waiting');

        toast.success('Refund claimed successfully!');
        await loadCampaigns();
      } catch (error: any) {
        console.error('Error claiming refund:', error);
        toast.error(formatError(error));
      }
    },
    [loadCampaigns]
  );

  // Get all contributions for transaction history
  const getAllContributions = useCallback(() => {
    return campaigns.flatMap((c) => c.contributions);
  }, [campaigns]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    setSelectedCampaign(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <Header
        view={view}
        setView={setView}
        walletConnected={walletConnected}
        setWalletConnected={
          walletConnected ? handleDisconnectWallet : handleConnectWallet
        }
        userAddress={userAddress}
        onBack={handleBack}
        showBack={selectedCampaign !== null}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Network error banner */}
        {networkError && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-500 text-sm">{networkError}</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading campaigns from blockchain...</p>
            </div>
          </div>
        )}

        {/* Campaign list view */}
        {!loading && view === 'explore' && !selectedCampaign && (
          <CampaignList
            campaigns={campaigns}
            onSelectCampaign={setSelectedCampaign}
            loading={loadingCampaigns}
            onRefresh={loadCampaigns}
          />
        )}

        {/* Campaign detail view */}
        {!loading && view === 'explore' && selectedCampaign && (
          <CampaignDetail
            campaign={selectedCampaign}
            onContribute={handleContribute}
            onVote={handleVote}
            userAddress={userAddress}
            walletConnected={walletConnected}
            onCampaignUpdated={loadCampaigns}
            onFinalize={handleFinalizeCampaign}
            onWithdraw={handleWithdrawFunds}
            onClaimRefund={handleClaimRefund}
          />
        )}

        {/* Create campaign view */}
        {view === 'create' && (
          <CreateCampaign
            onCreateCampaign={handleCreateCampaign}
            walletConnected={walletConnected}
            userAddress={userAddress}
            onCampaignCreated={loadCampaigns}
          />
        )}

        {/* Dashboard view */}
        {view === 'dashboard' && (
          <Dashboard campaigns={campaigns} userAddress={userAddress} />
        )}

        {/* Transaction history view */}
        {view === 'history' && (
          <TransactionHistory
            contributions={getAllContributions()}
            campaigns={campaigns}
          />
        )}
      </main>
    </div>
  );
}