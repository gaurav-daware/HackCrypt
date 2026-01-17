import { useState, useEffect } from 'react';
import {
  Clock, Target, TrendingUp, Users, CheckCircle2,
  XCircle, Vote, ExternalLink, Share2, Heart, AlertCircle, Shield, Loader2, Wallet, RefreshCw
} from 'lucide-react';
import { Campaign, Contribution } from '../App';
import { donateToCampaign, waitForTransaction, formatError, getContribution, getDonators } from '../blockchain/contract';
import { LOCAL_BLOCK_EXPLORER } from '../blockchain/config';
import { toast } from 'sonner';

type CampaignDetailProps = {
  campaign: Campaign;
  onContribute: (campaignId: string, contribution: Contribution) => void;
  onVote: (campaignId: string, milestoneId: string, voteFor: boolean) => void;
  userAddress: string;
  walletConnected: boolean;
  onCampaignUpdated: () => void;
  onFinalize?: (campaignId: string) => Promise<void>;
  onWithdraw?: (campaignId: string) => Promise<void>;
  onClaimRefund?: (campaignId: string) => Promise<void>;
};

export function CampaignDetail({ campaign, onContribute, onVote, userAddress, walletConnected, onCampaignUpdated, onFinalize, onWithdraw, onClaimRefund }: CampaignDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'contributions' | 'rewards'>('overview');
  const [contributeAmount, setContributeAmount] = useState('');
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [userContribution, setUserContribution] = useState<string>('0');
  const [isProcessing, setIsProcessing] = useState(false);

  // Local state for contributions since they are lazy loaded
  const [contributions, setContributions] = useState<Contribution[]>(campaign.contributions || []);
  const [loadingContributions, setLoadingContributions] = useState(false);

  const progress = (campaign.raised / campaign.goal) * 100;
  const daysLeft = Math.ceil((campaign.deadline - Date.now()) / (1000 * 60 * 60 * 24));
  const isOwner = userAddress.toLowerCase() === campaign.creator.toLowerCase();
  const deadlinePassed = Date.now() > campaign.deadline;
  const canFinalize = campaign.status === 'active' && deadlinePassed && isOwner;
  const canWithdraw = campaign.status === 'successful' && isOwner;
  const canRefund = campaign.status === 'failed' && parseFloat(userContribution) > 0;

  // Load user's contribution amount AND all campaign contributions
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user specific contribution
        if (walletConnected && userAddress) {
          const contribution = await getContribution(parseInt(campaign.id), userAddress);
          setUserContribution(contribution);
        }

        // Load all contributions for the campaign
        setLoadingContributions(true);
        const donatorsData = await getDonators(parseInt(campaign.id));
        const formattedContributions: Contribution[] = donatorsData.donators.map((donator: string, i: number) => ({
          id: `c_${campaign.id}_${i}`,
          campaignId: campaign.id,
          contributor: donator,
          amount: parseFloat(donatorsData.donations[i]),
          currency: campaign.currency,
          timestamp: Date.now(), // Timestamp not available in contract, using current or mock
          txHash: `0x...`, // Hash not available in simple arrays
        })).reverse(); // Newest first

        setContributions(formattedContributions);
      } catch (error) {
        console.error('Error loading campaign data:', error);
      } finally {
        setLoadingContributions(false);
      }
    };
    loadData();
  }, [walletConnected, userAddress, campaign.id]);

  const handleContribute = async () => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    const amount = parseFloat(contributeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsDonating(true);

    try {
      const campaignId = parseInt(campaign.id);
      if (isNaN(campaignId)) {
        throw new Error('Invalid campaign ID');
      }

      const loadingToast = toast.loading('Processing donation...');

      // Donate to campaign on blockchain
      const tx = await donateToCampaign(campaignId, amount.toString());

      toast.dismiss(loadingToast);
      toast.loading('Waiting for transaction confirmation...', { id: 'waiting' });

      // Wait for transaction to be mined
      const receipt = await waitForTransaction(tx);

      toast.dismiss('waiting');
      toast.success('Donation successful!', {
        description: (
          <a
            href={`${LOCAL_BLOCK_EXPLORER}tx/${receipt.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View on Local Explorer
          </a>
        ),
      });

      // Create contribution object for UI
      const contribution: Contribution = {
        id: `c_${Date.now()}`,
        campaignId: campaign.id,
        contributor: userAddress,
        amount,
        currency: campaign.currency,
        timestamp: Date.now(),
        txHash: receipt.hash,
        rewardTier: selectedReward || undefined,
      };

      // Reset form
      setContributeAmount('');
      setSelectedReward(null);
      setShowContributeModal(false);

      // Update local state immediately
      setContributions(prev => [contribution, ...prev]);

      // Update parent component
      onContribute(campaign.id, contribution);

      // Reload campaign data from blockchain
      onCampaignUpdated();
    } catch (error: any) {
      console.error('Error donating:', error);
      const errorMessage = formatError(error);
      toast.error('Donation failed', {
        description: errorMessage,
      });
    } finally {
      setIsDonating(false);
    }
  };

  const handleVoteOnMilestone = (milestoneId: string, voteFor: boolean) => {
    if (!walletConnected) {
      alert('Please connect your wallet to vote');
      return;
    }
    onVote(campaign.id, milestoneId, voteFor);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src={campaign.imageUrl}
          alt={campaign.title}
          className="w-full h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-center gap-2 text-blue-400 mb-3">
            <span className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-sm font-medium">
              {campaign.category}
            </span>
            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${campaign.status === 'active' ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
              campaign.status === 'successful' ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' :
                campaign.status === 'failed' ? 'bg-red-500/20 border border-red-500/30 text-red-400' :
                  'bg-slate-500/20 border border-slate-500/30 text-slate-400'
              }`}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">{campaign.title}</h1>
          <div className="flex items-center gap-3 text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
              <span className="text-sm">{campaign.creator}</span>
            </div>
            <span className="text-slate-500">•</span>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">{campaign.contributions.length} backers</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'overview'
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'milestones'
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              Milestones
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'rewards'
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              Rewards
            </button>
            <button
              onClick={() => setActiveTab('contributions')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'contributions'
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              History
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">About This Campaign</h2>
                  <p className="text-slate-300 leading-relaxed mb-6">{campaign.description}</p>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-blue-400 mb-1">Smart Contract Protection</h3>
                        <p className="text-sm text-slate-300">Funds are held in escrow and released only when milestones are achieved and approved by backers through voting.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-blue-400 mb-1">Transparent Tracking</h3>
                        <p className="text-sm text-slate-300">All transactions are recorded on the blockchain, providing immutable proof of contributions and fund allocation.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Campaign Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-slate-400">Campaign Started:</span>
                      <span className="text-white">
                        {new Date(campaign.deadline - 60 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-slate-400">Campaign Ends:</span>
                      <span className="text-white">{new Date(campaign.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-slate-400">Estimated Completion:</span>
                      <span className="text-white">
                        {new Date(campaign.deadline + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'milestones' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Funding Milestones</h2>
                  <span className="text-sm text-slate-400">
                    {campaign.milestones.filter(m => m.released).length} of {campaign.milestones.length} completed
                  </span>
                </div>

                <div className="space-y-4">
                  {campaign.milestones.map((milestone, index) => {
                    const totalVotes = milestone.votesFor + milestone.votesAgainst;
                    const approvalRate = totalVotes > 0 ? (milestone.votesFor / totalVotes) * 100 : 0;

                    return (
                      <div
                        key={milestone.id}
                        className={`border rounded-xl p-5 space-y-4 ${milestone.released
                          ? 'bg-green-500/5 border-green-500/20'
                          : milestone.unlocked
                            ? 'bg-blue-500/5 border-blue-500/20'
                            : 'bg-slate-800/30 border-slate-700/30'
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium text-slate-400">Milestone {index + 1}</span>
                              {milestone.released && (
                                <span className="px-2 py-1 rounded-lg bg-green-500/20 border border-green-500/30 text-xs font-medium text-green-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Released
                                </span>
                              )}
                              {milestone.unlocked && !milestone.released && (
                                <span className="px-2 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-xs font-medium text-blue-400 flex items-center gap-1">
                                  <Vote className="w-3 h-3" />
                                  Voting
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-white text-lg mb-1">{milestone.title}</h3>
                            <p className="text-slate-400 text-sm">{milestone.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-white">{milestone.targetAmount.toLocaleString()}</p>
                            <p className="text-sm text-slate-400">{campaign.currency}</p>
                          </div>
                        </div>

                        {milestone.unlocked && (
                          <div className="space-y-3 pt-3 border-t border-slate-700/50">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400">Community Approval</span>
                              <span className="text-white font-medium">{approvalRate.toFixed(0)}%</span>
                            </div>
                            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                style={{ width: `${approvalRate}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-green-400">{milestone.votesFor} for</span>
                              <span className="text-red-400">{milestone.votesAgainst} against</span>
                            </div>

                            {!milestone.released && (
                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => handleVoteOnMilestone(milestone.id, true)}
                                  className="flex-1 py-2 px-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleVoteOnMilestone(milestone.id, false)}
                                  className="flex-1 py-2 px-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-4">Reward Tiers</h2>
                {campaign.rewardTiers.map(tier => (
                  <div
                    key={tier.id}
                    className="border border-slate-700/50 rounded-xl p-5 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-white text-lg mb-1">{tier.title}</h3>
                        <p className="text-2xl font-bold text-blue-400">{tier.amount} {campaign.currency}</p>
                      </div>
                      {tier.maxBackers && (
                        <span className="text-sm text-slate-400">
                          {tier.backers}/{tier.maxBackers} claimed
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mb-4">{tier.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{tier.backers} backers</span>
                      <button
                        onClick={() => {
                          setSelectedReward(tier.id);
                          setContributeAmount(tier.amount.toString());
                          setShowContributeModal(true);
                        }}
                        className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-medium"
                        disabled={tier.maxBackers !== undefined && tier.backers >= tier.maxBackers}
                      >
                        {tier.maxBackers !== undefined && tier.backers >= tier.maxBackers ? 'Sold Out' : 'Select'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'contributions' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-4">Recent Contributions</h2>
                {campaign.contributions.length > 0 ? (
                  <div className="space-y-3">
                    {campaign.contributions.map(contribution => (
                      <div
                        key={contribution.id}
                        className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                          <div>
                            <p className="text-white font-medium">{contribution.contributor}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span>{new Date(contribution.timestamp).toLocaleDateString()}</span>
                              <span>•</span>
                              <a
                                href="#"
                                className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                                onClick={(e) => {
                                  e.preventDefault();
                                  alert(`View on block explorer: ${contribution.txHash}`);
                                }}
                              >
                                <ExternalLink className="w-3 h-3" />
                                {contribution.txHash}
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{contribution.amount} {contribution.currency}</p>
                          {contribution.rewardTier && (
                            <p className="text-xs text-blue-400">Reward tier selected</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No contributions yet. Be the first to back this campaign!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Funding Stats */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 space-y-6">
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-3xl font-bold text-white">{campaign.raised.toFixed(2)}</span>
                <span className="text-slate-400">{campaign.currency}</span>
              </div>
              <p className="text-slate-500 text-sm mb-4">
                raised of {campaign.goal.toLocaleString()} {campaign.currency} goal
              </p>
              <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-white">{campaign.contributions.length}</p>
                  <p className="text-slate-500 text-sm">backers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{daysLeft}</p>
                  <p className="text-slate-500 text-sm">days left</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {campaign.status === 'active' && !deadlinePassed && (
              <button
                onClick={() => setShowContributeModal(true)}
                disabled={!walletConnected}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {walletConnected ? 'Back This Campaign' : 'Connect Wallet to Contribute'}
              </button>
            )}

            {/* Owner Actions */}
            {isOwner && walletConnected && (
              <div className="space-y-2">
                {canFinalize && onFinalize && (
                  <button
                    onClick={async () => {
                      setIsProcessing(true);
                      try {
                        await onFinalize(campaign.id);
                        onCampaignUpdated();
                      } catch (error) {
                        console.error('Error finalizing:', error);
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Finalizing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Finalize Campaign
                      </>
                    )}
                  </button>
                )}

                {canWithdraw && onWithdraw && (
                  <button
                    onClick={async () => {
                      setIsProcessing(true);
                      try {
                        await onWithdraw(campaign.id);
                        onCampaignUpdated();
                      } catch (error) {
                        console.error('Error withdrawing:', error);
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Withdrawing...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4" />
                        Withdraw Funds
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Refund Button for Contributors */}
            {canRefund && onClaimRefund && walletConnected && (
              <button
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    await onClaimRefund(campaign.id);
                    onCampaignUpdated();
                    // Reload user contribution
                    const contribution = await getContribution(parseInt(campaign.id), userAddress);
                    setUserContribution(contribution);
                  } catch (error) {
                    console.error('Error claiming refund:', error);
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Claim Refund ({parseFloat(userContribution).toFixed(4)} {campaign.currency})
                  </>
                )}
              </button>
            )}

            {/* Status Badge */}
            <div className="pt-2 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Status:</span>
                <span className={`font-medium ${campaign.status === 'active' ? 'text-blue-400' :
                  campaign.status === 'successful' ? 'text-green-400' :
                    campaign.status === 'failed' ? 'text-red-400' :
                      'text-slate-400'
                  }`}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
              </div>
              {parseFloat(userContribution) > 0 && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-slate-400">Your Contribution:</span>
                  <span className="text-white font-medium">
                    {parseFloat(userContribution).toFixed(4)} {campaign.currency}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 px-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600 transition-all flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" />
                Save
              </button>
              <button className="flex-1 py-2 px-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600 transition-all flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Smart Contract Info */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Smart Contract
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Network:</span>
                <span className="text-white">Localhost</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Campaign ID:</span>
                <span className="text-white">#{campaign.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contribute Modal */}
      {showContributeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Back This Campaign</h3>
              <button
                onClick={() => {
                  setShowContributeModal(false);
                  setSelectedReward(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Contribution Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {campaign.currency}
                  </span>
                </div>
              </div>

              {selectedReward && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-blue-400 mb-1">Selected Reward:</p>
                  <p className="font-medium text-white">
                    {campaign.rewardTiers.find(t => t.id === selectedReward)?.title}
                  </p>
                </div>
              )}

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Network</span>
                  <span className="text-white">Localhost</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-white">
                    {contributeAmount || '0.00'} {campaign.currency}
                  </span>
                </div>
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                  Gas fees will be calculated by your wallet
                </div>
              </div>
            </div>

            <button
              onClick={handleContribute}
              disabled={!contributeAmount || parseFloat(contributeAmount) <= 0 || isDonating || !walletConnected}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDonating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Contribution'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
