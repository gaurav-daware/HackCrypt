import { useState } from 'react';
import { Plus, Upload, X, AlertCircle, Loader2 } from 'lucide-react';
import { Campaign, Milestone, RewardTier } from '../App';
import { createCampaign, waitForTransaction, formatError } from '../blockchain/contract';
import { getStoredAuth } from '../blockchain/auth';
import { toast } from 'sonner';

type CreateCampaignProps = {
  onCreateCampaign: (campaign: Campaign) => void;
  walletConnected: boolean;
  userAddress: string;
  onCampaignCreated: () => void;
};

export function CreateCampaign({ onCreateCampaign, walletConnected, userAddress, onCampaignCreated }: CreateCampaignProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('30');
  const [category, setCategory] = useState('Social Impact');
  const [imageUrl, setImageUrl] = useState('');

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 'm1',
      title: '',
      description: '',
      targetAmount: 0,
      unlocked: false,
      votesFor: 0,
      votesAgainst: 0,
      released: false,
    }
  ]);

  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>([
    {
      id: 'tier1',
      title: '',
      amount: 0,
      description: '',
      backers: 0,
    }
  ]);

  const categories = ['Social Impact', 'Education', 'Environment', 'Technology', 'Healthcare', 'Arts & Culture'];

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        id: `m${milestones.length + 1}`,
        title: '',
        description: '',
        targetAmount: 0,
        unlocked: false,
        votesFor: 0,
        votesAgainst: 0,
        released: false,
      }
    ]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const addRewardTier = () => {
    setRewardTiers([
      ...rewardTiers,
      {
        id: `tier${rewardTiers.length + 1}`,
        title: '',
        amount: 0,
        description: '',
        backers: 0,
      }
    ]);
  };

  const removeRewardTier = (index: number) => {
    if (rewardTiers.length > 1) {
      setRewardTiers(rewardTiers.filter((_, i) => i !== index));
    }
  };

  const updateRewardTier = (index: number, field: string, value: any) => {
    const updated = [...rewardTiers];
    updated[index] = { ...updated[index], [field]: value };
    setRewardTiers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const auth = getStoredAuth();
    if (!walletConnected || !userAddress || !auth.isAuthenticated) {
      toast.error('Please login with your wallet first');
      return;
    }

    if (!title || !description || !goal || !imageUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate goal amount
    const goalAmount = parseFloat(goal);
    if (isNaN(goalAmount) || goalAmount <= 0) {
      toast.error('Please enter a valid funding goal');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate deadline (duration in days)
      const deadline = Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000;

      // Show loading toast
      const loadingToast = toast.loading('Creating campaign on blockchain...');

      // Create campaign on blockchain
      const tx = await createCampaign(
        userAddress,
        title,
        description,
        goalAmount.toString(),
        deadline,
        imageUrl
      );

      toast.dismiss(loadingToast);
      toast.loading('Waiting for transaction confirmation...', { id: 'waiting' });

      // Wait for transaction to be mined
      const receipt = await waitForTransaction(tx);

      toast.dismiss('waiting');
      toast.success('Campaign created successfully!', {
        description: `Transaction: ${receipt.hash.slice(0, 10)}...`,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setGoal('');
      setDuration('30');
      setImageUrl('');
      setMilestones([{
        id: 'm1',
        title: '',
        description: '',
        targetAmount: 0,
        unlocked: false,
        votesFor: 0,
        votesAgainst: 0,
        released: false,
      }]);
      setRewardTiers([{
        id: 'tier1',
        title: '',
        amount: 0,
        description: '',
        backers: 0,
      }]);

      // Reload campaigns from blockchain
      onCampaignCreated();
      onCreateCampaign({} as Campaign); // Trigger view change
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      const errorMessage = formatError(error);
      toast.error('Failed to create campaign', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Campaign</h1>
          <p className="text-slate-400">Launch your project with blockchain-powered transparency and security</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Campaign Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a clear, compelling title"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project, its goals, and impact"
                rows={6}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Funding Goal (MATIC) *
                </label>
                <input
                  type="number"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Duration (days) *
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                  min="1"
                  max="90"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Campaign Image URL *
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <button
                  type="button"
                  className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                </button>
              </div>
              {imageUrl && (
                <div className="mt-3 relative rounded-lg overflow-hidden h-48">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Funding Milestones</h2>
                <p className="text-sm text-slate-400 mt-1">Define stages for fund release based on project progress</p>
              </div>
              <button
                type="button"
                onClick={addMilestone}
                className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Milestone
              </button>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-300">
                <p className="font-medium text-blue-400 mb-1">Important:</p>
                <p>The sum of all milestone amounts must equal your funding goal. Funds will be released only when each milestone is approved by backers through voting.</p>
              </div>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400">Milestone {index + 1}</span>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                        placeholder="Milestone title"
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <textarea
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        placeholder="Describe what will be accomplished"
                        rows={2}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={milestone.targetAmount || ''}
                        onChange={(e) => updateMilestone(index, 'targetAmount', parseFloat(e.target.value) || 0)}
                        placeholder="Amount (ETH)"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-sm text-slate-400">
              <p className="text-blue-400 mb-2">
                Note: Milestones are not stored on-chain in the current contract version.
                They can be added as a future enhancement.
              </p>
            </div>
          </div>

          {/* Reward Tiers */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Reward Tiers</h2>
                <p className="text-sm text-slate-400 mt-1">Offer incentives for different contribution levels</p>
              </div>
              <button
                type="button"
                onClick={addRewardTier}
                className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Tier
              </button>
            </div>

            <div className="space-y-4">
              {rewardTiers.map((tier, index) => (
                <div key={tier.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400">Tier {index + 1}</span>
                    {rewardTiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRewardTier(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        value={tier.title}
                        onChange={(e) => updateRewardTier(index, 'title', e.target.value)}
                        placeholder="Tier name"
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={tier.amount || ''}
                        onChange={(e) => updateRewardTier(index, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="Amount (ETH)"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <textarea
                        value={tier.description}
                        onChange={(e) => updateRewardTier(index, 'description', e.target.value)}
                        placeholder="Describe the rewards and perks"
                        rows={2}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4 border-t border-slate-700/50">
            {!walletConnected && (
              <div className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <p className="text-yellow-400 text-sm">
                  Please connect your wallet to create a campaign on the blockchain.
                </p>
              </div>
            )}
            <button
              type="submit"
              disabled={!walletConnected || isSubmitting}
              className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Campaign...
                </>
              ) : (
                'Deploy Campaign on Blockchain'
              )}
            </button>
            <button
              type="button"
              className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            >
              Save Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
