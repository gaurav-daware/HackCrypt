import { TrendingUp, Users, Target, Award, ExternalLink } from 'lucide-react';
import { Campaign } from '../App';

type DashboardProps = {
  campaigns: Campaign[];
  userAddress: string;
};

export function Dashboard({ campaigns, userAddress }: DashboardProps) {
  // Get campaigns created by user
  const myCampaigns = campaigns.filter(c => c.creator === userAddress);
  
  // Get campaigns user has backed
  const backedCampaigns = campaigns.filter(c => 
    c.contributions.some(contrib => contrib.contributor === userAddress)
  );

  // Calculate user stats
  const totalRaised = myCampaigns.reduce((sum, c) => sum + c.raised, 0);
  const totalBackers = myCampaigns.reduce((sum, c) => sum + c.contributions.length, 0);
  const totalContributed = campaigns.reduce((sum, c) => {
    const userContribs = c.contributions.filter(contrib => contrib.contributor === userAddress);
    return sum + userContribs.reduce((s, contrib) => s + contrib.amount, 0);
  }, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Manage your campaigns and track your contributions</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm text-blue-400 font-medium">My Campaigns</span>
          </div>
          <p className="text-3xl font-bold text-white">{myCampaigns.length}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-purple-400 font-medium">Total Raised</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalRaised.toFixed(2)} ETH</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-pink-400" />
            </div>
            <span className="text-sm text-pink-400 font-medium">Total Backers</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalBackers}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm text-green-400 font-medium">Contributed</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalContributed.toFixed(2)} ETH</p>
        </div>
      </div>

      {/* My Campaigns */}
      {myCampaigns.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">My Campaigns</h2>
          <div className="space-y-4">
            {myCampaigns.map(campaign => {
              const progress = (campaign.raised / campaign.goal) * 100;
              const daysLeft = Math.ceil((campaign.deadline - Date.now()) / (1000 * 60 * 60 * 24));
              const completedMilestones = campaign.milestones.filter(m => m.released).length;

              return (
                <div
                  key={campaign.id}
                  className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <img
                      src={campaign.imageUrl}
                      alt={campaign.title}
                      className="w-full md:w-48 h-32 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-white">{campaign.title}</h3>
                          <span className="px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/30 text-sm font-medium text-green-400">
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm line-clamp-2">{campaign.description}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Raised</p>
                          <p className="text-lg font-bold text-white">{campaign.raised.toFixed(2)} ETH</p>
                          <p className="text-xs text-slate-500">of {campaign.goal.toFixed(0)} ETH</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Progress</p>
                          <p className="text-lg font-bold text-white">{progress.toFixed(0)}%</p>
                          <div className="mt-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Backers</p>
                          <p className="text-lg font-bold text-white">{campaign.contributions.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Days Left</p>
                          <p className="text-lg font-bold text-white">{daysLeft}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-400">
                            Milestones: <span className="text-white font-medium">{completedMilestones}/{campaign.milestones.length}</span>
                          </span>
                          <span className="text-slate-400">
                            Rewards: <span className="text-white font-medium">{campaign.rewardTiers.length}</span>
                          </span>
                        </div>
                        <button className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-medium flex items-center gap-2">
                          Manage
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Backed Campaigns */}
      {backedCampaigns.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Campaigns I'm Backing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {backedCampaigns.map(campaign => {
              const progress = (campaign.raised / campaign.goal) * 100;
              const myContributions = campaign.contributions.filter(c => c.contributor === userAddress);
              const myTotal = myContributions.reduce((sum, c) => sum + c.amount, 0);

              return (
                <div
                  key={campaign.id}
                  className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all"
                >
                  <div className="relative h-32">
                    <img
                      src={campaign.imageUrl}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                  </div>
                  
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-white text-lg mb-1 line-clamp-1">{campaign.title}</h3>
                      <p className="text-slate-400 text-sm">by {campaign.creator}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Your contribution</span>
                        <span className="text-white font-medium">{myTotal.toFixed(3)} ETH</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Campaign progress</span>
                        <span className="text-white font-medium">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <button className="w-full py-2 px-4 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 transition-colors text-sm font-medium">
                      View Campaign
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {myCampaigns.length === 0 && backedCampaigns.length === 0 && (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No campaigns yet</h3>
          <p className="text-slate-400 mb-6">Create your first campaign or back existing projects</p>
          <div className="flex gap-3 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
              Create Campaign
            </button>
            <button className="px-6 py-3 bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 rounded-lg transition-colors font-medium">
              Explore Projects
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
