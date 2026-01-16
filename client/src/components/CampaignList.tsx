import { Search, TrendingUp, Clock, Target, Award, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Campaign } from '../App';

type CampaignListProps = {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  loading?: boolean;
  onRefresh?: () => void;
};

export function CampaignList({ campaigns, onSelectCampaign, loading = false, onRefresh }: CampaignListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Social Impact', 'Education', 'Environment', 'Technology', 'Healthcare'];

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || campaign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalRaised = campaigns.reduce((sum, c) => sum + c.raised, 0);
  const totalBackers = campaigns.reduce((sum, c) => sum + c.contributions.length, 0);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1">
        <div className="bg-slate-950 rounded-xl p-8 md:p-12">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Fund the Future with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Blockchain</span>
            </h2>
            <p className="text-slate-300 text-lg mb-6">
              Transparent, secure, and trustworthy crowdfunding powered by smart contracts. Every contribution is tracked on-chain, every milestone is verifiable.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">Total Raised</span>
                </div>
                <p className="text-2xl font-bold text-white">{totalRaised.toFixed(2)} ETH</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-purple-400 mb-1">
                  <Target className="w-5 h-5" />
                  <span className="text-sm">Active Campaigns</span>
                </div>
                <p className="text-2xl font-bold text-white">{campaigns.length}</p>
              </div>
              <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-pink-400 mb-1">
                  <Award className="w-5 h-5" />
                  <span className="text-sm">Total Backers</span>
                </div>
                <p className="text-2xl font-bold text-white">{totalBackers}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white hover:border-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Grid */}
      {loading && campaigns.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading campaigns from blockchain...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map(campaign => {
          const progress = (campaign.raised / campaign.goal) * 100;
          const daysLeft = Math.ceil((campaign.deadline - Date.now()) / (1000 * 60 * 60 * 24));
          
          return (
            <div
              key={campaign.id}
              onClick={() => onSelectCampaign(campaign)}
              className="group cursor-pointer bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-blue-500/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-medium text-white">
                  {campaign.category}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-60" />
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {campaign.title}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2">
                    {campaign.description}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-bold">{campaign.raised.toFixed(2)} {campaign.currency}</p>
                      <p className="text-slate-500 text-xs">of {campaign.goal.toFixed(0)} {campaign.currency}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{daysLeft} days left</span>
                      </div>
                      <p className="text-slate-500 text-xs">{campaign.contributions.length} backers</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                  <span>{campaign.creator}</span>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
      
      {!loading && filteredCampaigns.length === 0 && campaigns.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No campaigns found</h3>
          <p className="text-slate-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
